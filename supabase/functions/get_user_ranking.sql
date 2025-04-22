
CREATE OR REPLACE FUNCTION get_user_ranking(user_id UUID)
RETURNS TABLE (rank bigint)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH user_points AS (
    SELECT 
      us.user_id,
      COUNT(*) * 10 as total_points,
      RANK() OVER (ORDER BY COUNT(*) DESC) as user_rank
    FROM user_statistics us
    GROUP BY us.user_id
  )
  SELECT user_rank
  FROM user_points
  WHERE user_id = $1;
END;
$$;
