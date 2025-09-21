"use server"

const getOrganizationByKey = async (key: string) => {
  if (!key) return false

  const endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/organizations/key/${key}`
  const response = await fetch(endpoint)
  const organization = await response.json()

  return organization
}

export { getOrganizationByKey }
