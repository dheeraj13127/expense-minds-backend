interface recordsType {
  _id: string | null;
  totalExpenseSum: number;
  totalIncomeSum: number;
  netTotal: number;
  data: {
    _id: string;
    expense: number;
    income: number;
    records: {
      _id: string;
      amount: number;
      category: string;
      amountType: string;
      account: string;
      note: string;
      date?: string;
    }[];
  }[];
}

export { recordsType };
