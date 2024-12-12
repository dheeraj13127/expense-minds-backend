import { InitialAccountsDataType } from "../../interfaces/initialDataInterface";

export const initialAccountsData: InitialAccountsDataType[] = [
  {
    groupName: "Cash",
    subAccounts: [
      {
        name: "Cash",
        description: "",
        amount: 0.0,
      },
    ],
  },
  {
    groupName: "Card",
    subAccounts: [
      {
        name: "Credit Card",
        description: "",
        amount: 0.0,
      },
      {
        name: "Debit Card",
        description: "",
        amount: 0.0,
      },
    ],
  },
  {
    groupName: "Accounts",
    subAccounts: [
      {
        name: "Bank Account",
        description: "",
        amount: 0.0,
      },
    ],
  },
  {
    groupName: "Loan",
    subAccounts: [
      {
        name: "Loan",
        description: "",
        amount: 0.0,
      },
    ],
  },
];
