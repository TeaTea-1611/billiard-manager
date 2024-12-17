import prisma from "../prisma";

class TableService {
  async getTablesWithStatus() {
    const tablesWithStatus = await prisma.table.findMany({
      include: {
        playSessions: {
          where: { endTime: null },
        },
      },
    });

    return tablesWithStatus.map((table) => ({
      ...table,
      isAvailable: table.playSessions.length === 0,
    }));
  }
}

const tableService = new TableService();
export default tableService;
