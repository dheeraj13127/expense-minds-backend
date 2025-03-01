import { embeddings, pinecone } from "../../index";
import { recordsType } from "../interfaces/recordsInterface";
import { getDayRecordsForPineCone } from "../utils/recordHelpers/recordHelpers";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export const indexRecordsToPineCone = async (req: any, res: any) => {
  try {
    const userId = req.user._id;
    const records: recordsType[] = await getDayRecordsForPineCone(req.user._id);
    const indexName = process.env?.PINCECONE_INDEX_NAME;
    const index = pinecone.Index(indexName ? indexName : "");

    const formattedText = records
      .map((rec) => {
        const groupedRecords = rec.data
          .map((month) => {
            const records = month.records
              .map(
                (record) =>
                  `${record.amountType} of ${record.amount}$ in the category ${record.category} on ${record.date} using ${record.account} and with a description saying ${record.note}`
              )
              .join(", ");

            return `In ${month._id}, there was a total of ${month.expense}$ in expenses and income of total ${month.income}$, with a breakdown as follows: ${records}.`;
          })
          .join("\n ");
        return `The user's overall total expense is ${rec.totalExpenseSum}$ ,with overall total income as ${rec.totalIncomeSum}$ and the computed overall net total is ${rec.netTotal}$. Now the records are categorised under each month along with respective year as follows: ${groupedRecords}`;
      })
      .join("\n ");
    console.log(formattedText);
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 512,
      chunkOverlap: 100,
    });
    // Breakdown the formatted text into smaller chunks
    const textChunks = await splitter.splitText(formattedText);

    // Create the embeddings of the chunks to store in pinecone
    const textEmbeddings = await embeddings.embedDocuments(textChunks);

    // Map the vector data for each similar embedding and chunk
    let batch = [];
    for (let i = 0; i < textChunks.length; i++) {
      const vector = {
        id: userId.toString() + (i + 1).toString(),
        values: textEmbeddings[i],
        metadata: {
          userId,
          details: textChunks[i],
        },
      };
      batch.push(vector);
    }
    // Upload the data to pinecone
    index.namespace(userId).upsert(batch);
    return res.status(200).json({
      status: "success",
      message: "Indexed records to pincecone successfully",
    });
  } catch (err) {
    return res.status(400).json({ message: "Failed to get messages !" });
  }
};
