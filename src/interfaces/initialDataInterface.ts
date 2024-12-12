interface SubAccountsType {
  name: String;
  description: String;
  amount: Number;
}

interface InitialAccountsDataType {
  groupName: String;
  subAccounts: SubAccountsType[];
}

interface InitialCategoriesDataType {
  categoryName: String;
  categorySymbol: String;
}

export { InitialAccountsDataType, InitialCategoriesDataType };
