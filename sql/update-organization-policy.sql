-- Policy to allow organizations to update their own data
-- Users linked to an organization can update that organization's information

DROP POLICY IF EXISTS "Organizations can update their own data" ON organizations;

CREATE POLICY "Organizations can update their own data"
  ON organizations FOR UPDATE
  USING (
    id IN (
      SELECT organization_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    id IN (
      SELECT organization_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

