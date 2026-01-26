-- Drop and recreate the trigger function with proper unnest handling
CREATE OR REPLACE FUNCTION public.generate_painting_tags()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    all_values TEXT[];
    filtered_tags TEXT[];
    val TEXT;
BEGIN
    -- Build array of all possible tag values
    all_values := ARRAY[]::TEXT[];
    
    -- Add fabrics
    IF NEW.fabrics IS NOT NULL THEN
        all_values := all_values || NEW.fabrics;
    END IF;
    
    -- Add single values
    IF NEW.silhouette IS NOT NULL AND NEW.silhouette != '' THEN
        all_values := array_append(all_values, NEW.silhouette);
    END IF;
    IF NEW.neckline IS NOT NULL AND NEW.neckline != '' THEN
        all_values := array_append(all_values, NEW.neckline);
    END IF;
    IF NEW.sleeves IS NOT NULL AND NEW.sleeves != '' THEN
        all_values := array_append(all_values, NEW.sleeves);
    END IF;
    IF NEW.color_mood IS NOT NULL AND NEW.color_mood != '' THEN
        all_values := array_append(all_values, NEW.color_mood);
    END IF;
    IF NEW.palette_effect IS NOT NULL AND NEW.palette_effect != '' THEN
        all_values := array_append(all_values, NEW.palette_effect);
    END IF;
    IF NEW.mood_primary IS NOT NULL AND NEW.mood_primary != '' THEN
        all_values := array_append(all_values, NEW.mood_primary);
    END IF;
    IF NEW.suggested_season IS NOT NULL AND NEW.suggested_season != '' THEN
        all_values := array_append(all_values, NEW.suggested_season);
    END IF;
    IF NEW.artist IS NOT NULL AND NEW.artist != '' THEN
        all_values := array_append(all_values, NEW.artist);
    END IF;
    IF NEW.era IS NOT NULL AND NEW.era != '' THEN
        all_values := array_append(all_values, NEW.era);
    END IF;
    
    -- Add array values
    IF NEW.prints_patterns IS NOT NULL THEN
        all_values := all_values || NEW.prints_patterns;
    END IF;
    IF NEW.jewelry_types IS NOT NULL THEN
        all_values := all_values || NEW.jewelry_types;
    END IF;
    IF NEW.mood_secondary IS NOT NULL THEN
        all_values := all_values || NEW.mood_secondary;
    END IF;
    
    -- Filter out nulls and empty strings, get distinct values
    filtered_tags := ARRAY[]::TEXT[];
    FOREACH val IN ARRAY all_values LOOP
        IF val IS NOT NULL AND val != '' AND NOT (val = ANY(filtered_tags)) THEN
            filtered_tags := array_append(filtered_tags, val);
        END IF;
    END LOOP;
    
    NEW.tags := filtered_tags;
    RETURN NEW;
END;
$function$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS generate_painting_tags_trigger ON public.paintings;
CREATE TRIGGER generate_painting_tags_trigger
    BEFORE INSERT OR UPDATE ON public.paintings
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_painting_tags();