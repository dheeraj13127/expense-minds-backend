import { openAiModel } from "../..";
import {
  processRecordsByDaySummaryValidation,
  processRecordsByMonthSummaryValidation,
} from "../joi/automatedJOI";

export const processRecordsByDaySummary = async (req: any, res: any) => {
  const { recordsByDay } = req.body.data;
  try {
    const { error } = processRecordsByDaySummaryValidation.validate(
      req.body.data
    );
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const prompt = `
        Below you will be provided with the records data. A record is nothing but a each single transaction made.
        totalExpenseSum: Is the total expense for the whole month
        totalIncomeSum: Is the total income for the whole month
        netTotal: Is the calculated net total for the whole month
        data: Contains array of items grouped under each date of the month.
              Each item in the data is shown below:
                _id: It represents the particular date in the month.
                expense: It is the calculated total expense for that individual day.
                income: It is the calculated total income for that individual day.
                records: This is the array of transactions made under particular date.
                         Each item in the record contains:
                          account: The mode of payment or transaction. Ex: Credit and Debit Cards,Cash,EFTPOS.
                          amount: The amount involved in the transaction.
                          amountType: It is the type of transaction. Either it can be Income or Expense.
                          category: The category of transaction. Ex: Social life, Movie, Education etc.
                          note: It is the description about the transaction.
    
        Now you will be provided with the records data below:
        ${JSON.stringify(recordsByDay)}.
    
        By considering all the above provided instructions, generate a detailed overall monthly spending summary.
        Keep it simple and straight forward. Always stick with provided instructions. Creat a simple small paragraph summary.
        Also try suggesting the ways to improve the situation. 
        `;
    const response = await openAiModel.chat.completions.create({
      model: "gpt-4o-mini",

      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      max_tokens: 500,
    });
    const result = response.choices[0].message.content?.split("+");
    let summary = "";
    //@ts-ignore
    result.forEach((item) => {
      summary += item + "\n";
    });
    return res.status(200).json({
      message: "Generated summary successfully",
      summary: summary,
    });
  } catch (err) {
    return res.status(400).json({ message: "Failed to process summary !" });
  }
};

export const processRecordsByMonthSummary = async (req: any, res: any) => {
  const { recordsByMonth } = req.body.data;
  try {
    const { error } = processRecordsByMonthSummaryValidation.validate(
      req.body.data
    );
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const prompt = `
          Below you will be provided with the records data. A record is nothing but a each single transaction made.
          totalExpenseSum: Is the total expense for the whole year
          totalIncomeSum: Is the total income for the whole year
          netTotal: Is the calculated net total for the whole year
          data: Contains array of items grouped under each month of the year.
                Each item in the data is shown below:
                  _id: It represents the particular month of the year. It starts from "01" means January,"02" means February
                       and it continues till "12" means December.
                  expense: It is the calculated total expense for that whole month.
                  income: It is the calculated total income for that whole month.
                  records: This is the array of transactions made under particular month.
                           Each item in the record contains:
                            account: The mode of payment or transaction. Ex: Credit and Debit Cards,Cash,EFTPOS.
                            amount: The amount involved in the transaction.
                            amountType: It is the type of transaction. Either it can be Income or Expense.
                            category: The category of transaction. Ex: Social life, Movie, Education etc.
                            note: It is the description about the transaction.
      
          Now you will be provided with the records data below:
          ${JSON.stringify(recordsByMonth)}.
      
          By considering all the above provided instructions, generate a detailed overall yearly spending summary.
          Keep it simple and straight forward. Always stick with provided instructions. Creat a simple small paragraph summary.
          Also try suggesting the ways to improve the situation. 
          `;
    const response = await openAiModel.chat.completions.create({
      model: "gpt-4o-mini",

      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      max_tokens: 500,
    });
    const result = response.choices[0].message.content?.split("+");
    let summary = "";
    //@ts-ignore
    result.forEach((item) => {
      summary += item + "\n";
    });
    return res.status(200).json({
      message: "Generated summary successfully",
      summary: summary,
    });
  } catch (err) {
    return res.status(400).json({ message: "Failed to process summary !" });
  }
};
