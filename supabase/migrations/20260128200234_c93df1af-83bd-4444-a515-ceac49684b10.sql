-- Add time_period column to subtypes table
ALTER TABLE public.subtypes 
ADD COLUMN time_period character varying DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.subtypes.time_period IS 'Time period within season: early, mid, or late';