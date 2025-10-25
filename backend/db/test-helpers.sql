-- ============================================
-- HELPER FUNCTIONS FOR TESTING
-- These RPC functions help tests introspect schema
-- ============================================

-- Helper function to get column information
CREATE OR REPLACE FUNCTION get_column_info(p_table_name text, p_column_name text)
RETURNS TABLE (
  column_name text,
  data_type text,
  is_nullable text,
  column_default text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.column_name::text,
    c.data_type::text,
    c.is_nullable::text,
    c.column_default::text
  FROM information_schema.columns c
  WHERE c.table_name = p_table_name
    AND c.column_name = p_column_name;
END;
$$ LANGUAGE plpgsql;

-- Helper function to get foreign key information
CREATE OR REPLACE FUNCTION get_foreign_keys(p_table_name text)
RETURNS TABLE (
  column_name text,
  foreign_table_name text,
  foreign_column_name text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    kcu.column_name::text,
    ccu.table_name::text,
    ccu.column_name::text
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
  JOIN information_schema.constraint_column_usage ccu
    ON tc.constraint_name = ccu.constraint_name
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = p_table_name;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_column_info IS 'Helper function for schema validation tests - returns column metadata';
COMMENT ON FUNCTION get_foreign_keys IS 'Helper function for schema validation tests - returns foreign key relationships';

