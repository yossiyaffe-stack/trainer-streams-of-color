import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Popular face datasets on Hugging Face
const FACE_DATASETS = {
  'celebahq': {
    // Public, viewer-enabled dataset
    id: 'saitsharipov/CelebA-HQ',
    name: 'CelebA-HQ',
    description: 'High-quality celebrity faces (30k images)',
    imageKey: 'image',
  },
  'ffhq': {
    // Public, viewer-enabled dataset (256px)
    id: 'bitmind/ffhq-256',
    name: 'FFHQ',
    description: 'Flickr Faces HQ (70k diverse faces)',
    imageKey: 'image',
  },
  'lfw': {
    // Public, viewer-enabled LFW dataset
    id: 'bitmind/lfw',
    name: 'Labeled Faces in the Wild',
    description: 'Face verification benchmark dataset',
    imageKey: 'image',
  },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { action, dataset, offset = 0, limit = 20, images } = body as any;

    // List available datasets
    if (action === 'list-datasets') {
      return new Response(
        JSON.stringify({
          success: true,
          datasets: Object.entries(FACE_DATASETS).map(([key, value]) => ({
            key,
            ...value,
          })),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Browse dataset images
    if (action === 'browse') {
      if (!dataset || !FACE_DATASETS[dataset as keyof typeof FACE_DATASETS]) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid dataset' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const datasetInfo = FACE_DATASETS[dataset as keyof typeof FACE_DATASETS];
      
      // Fetch from Hugging Face Datasets API
      const apiUrl = `https://datasets-server.huggingface.co/rows?dataset=${encodeURIComponent(datasetInfo.id)}&config=default&split=train&offset=${offset}&length=${limit}`;
      
      console.log('Fetching from HuggingFace:', apiUrl);
      
      // Get HuggingFace token for authenticated access to gated datasets
      const hfToken = Deno.env.get('HF_TOKEN');
      
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      
      if (hfToken) {
        headers['Authorization'] = `Bearer ${hfToken}`;
      }
      
      const response = await fetch(apiUrl, { headers });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HuggingFace API error:', errorText);

        // Return 200 so the web client gets a structured error (instead of FunctionsHttpError)
        const hint = response.status === 401
          ? 'This dataset may be gated. Add an HF_TOKEN in backend secrets or choose a public dataset.'
          : undefined;

        return new Response(
          JSON.stringify({
            success: false,
            error: `HuggingFace API error: ${response.status}`,
            hint,
            details: errorText?.slice?.(0, 500) || null,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      
      // Extract image URLs from the response
      const images = data.rows?.map((row: any, index: number) => {
        const imageData = row.row?.[datasetInfo.imageKey] || row.row?.image;
        return {
          id: `${dataset}-${offset + index}`,
          sourceId: `${offset + index}`,
          url: imageData?.src || imageData?.url || null,
          width: imageData?.width,
          height: imageData?.height,
          dataset: dataset,
          datasetName: datasetInfo.name,
        };
      }).filter((img: any) => img.url) || [];

      return new Response(
        JSON.stringify({
          success: true,
          images,
          total: data.num_rows_total || 0,
          offset,
          limit,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Import selected images to database
    if (action === 'import') {
      if (!images || !Array.isArray(images) || images.length === 0) {
        return new Response(
          JSON.stringify({ success: false, error: 'No images provided' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const imported: string[] = [];
      const errors: string[] = [];

      for (const image of images) {
        try {
          // Map dataset key to data_source enum
          let source: 'celeba_hq' | 'ffhq' | 'training_upload' = 'training_upload';
          if (image.dataset === 'celebahq') source = 'celeba_hq';
          else if (image.dataset === 'ffhq') source = 'ffhq';

          // Insert into face_images table
          const { data: faceImage, error: insertError } = await supabase
            .from('face_images')
            .insert({
              source,
              source_id: image.sourceId,
              storage_path: image.url, // Store the HuggingFace URL directly
              thumbnail_path: image.url,
              original_filename: `${image.dataset}_${image.sourceId}.jpg`,
              width: image.width,
              height: image.height,
              is_processed: false,
            })
            .select()
            .single();

          if (insertError) {
            console.error('Insert error:', insertError);
            errors.push(`${image.id}: ${insertError.message}`);
          } else {
            // Create empty color_labels record for this image
            await supabase.from('color_labels').insert({
              face_image_id: faceImage.id,
              label_status: 'unlabeled',
            });
            
            imported.push(faceImage.id);
          }
        } catch (err) {
          console.error('Import error for image:', image.id, err);
          errors.push(`${image.id}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          imported: imported.length,
          errors: errors.length > 0 ? errors : undefined,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
