// Reusable Prisma select objects
export const villageSelect = {
  id: true,
  mddsPlcn: true,
  name: true,
  subDistrict: {
    select: {
      name: true,
      district: {
        select: {
          name: true,
          state: {
            select: { name: true }
          }
        }
      }
    }
  }
};
