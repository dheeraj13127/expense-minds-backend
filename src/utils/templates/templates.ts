export const standAloneQuestionPromptTemplate = (
  conversation: string,
  last_message: string
) => {
  return `Follow these steps to rephrase the user messages.
The conversation will be delimited with four hashtags,\
i.e. ####.
The last user message will be delimited with four plus signs,\
i.e. ++++

conversation: ####
${conversation}
####

last user message: ++++
${last_message}
++++

Step 1:#### First decide whether the last user message is \
dependent on the conversation or is it standalone. \
greetings doesn't count.

Step 2:#### If the last user message is independent of the conversation \
just write out the last user message as it is in the rephrased last user message section and skip the step 3. \

Step 3:#### only if the last user message is dependent on the conversation then Please take the last user message and \
rephrase it into a standalone, more detailed message that includes relevant context from the conversation \
such that last message is state less and could be understood without reading the conversation \

rephrase the last user message in a friendly tone.

Use the following format:
Step 1:#### <step 1 reasoning>
Step 2:#### <step 2 reasoning>
Step 3:#### <step 3 reasoning>
rephrased last user message :#### <last user message>
Make sure to include #### to separate every step.`;
};

export const botAnswerPromptTemplate = (
  conversation: string,
  records_data: string,
  last_message: string
) => {
  return `Strictly follow these steps to answer the user queries.
      The user query will be delimited with four percentile symbols,\
      i.e. %%%%.
      
      Step 1:#### First read the whole conversation. The conversation could also be empty .the conversation is delimited by four plus signs i.e. ++++.
      conversation:++++
      ${conversation}
      ++++
      Step 2: #### Read the whole records data. the records data is delimited by four minus signs i.e. ----.
      records data:----
      ${records_data}
      ----
      Step 3: Understand the user query. the user query is delimited by four percentile symbols.
      user query:%%%%
      ${last_message}
      %%%%
      
      Step 4:####: If the user has made any assumptions, \
      figure out whether the assumption is true based on the \
      records data information.
      
      Step 5:####: First, politely correct the \
      user's incorrect assumptions if applicable. \
      Answer the user in a friendly tone. keep the answers short and concise unless asked for details.
      
      
      Use the following format:
      Step 1:#### <step 1 reasoning>
      Step 2:#### <step 2 reasoning>
      Step 3:#### <step 3 reasoning>
      Step 4:#### <step 4 reasoning>
      Response to user:#### <response to user>
      
      Make sure to include #### to separate every step.
      NOTE: ANSWER THE QUERY IN THE SAME LANGUAGE AS IN THE CONVERSATION/USER QUERY.
`;
};
