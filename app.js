require('dotenv').config()
const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
    // 1 create an assistant
    const assistant = await openai.beta.assistants.create({
        model: "gpt-3.5-turbo-1106",
        instructions: "You are a translator from English to Italian.",
        name: "Italian Translator",
        tools: [{ type: "retrieval" }]
    })

    // 2 create a thread
    const thread = await openai.beta.threads.create()

    // 3 add a message to the thread
    const message = await openai.beta.threads.messages.create(
        thread.id,
        {
            role: "user",
            content: "How do you say 'hello, nice to meet you' in Italian?",
        }
    )

    // 4 run the assistant
    const run = await openai.beta.threads.runs.create(
        thread.id,
        { 
          assistant_id: assistant.id,
          instructions: "Please address the user as Abigail."
        }
    )

    // 5 check run status
    const retrieveRun = async () => {
        let keepRetrievingRun

        while (run.status !== "completed") {
            keepRetrievingRun = await openai.beta.threads.runs.retrieve(
                (thread_id = thread.id),
                (run_id = run.id)
            );
    
            console.log(`Run status: ${keepRetrievingRun.status}`)
    
            if (keepRetrievingRun.status === "completed") {
                console.log("\n")
                break
            }
        }
    }
    retrieveRun()

    // 6 display the assistants message to the thread
    const waitForAssistantMessage = async () => {
        await retrieveRun()

        const allMessages = await openai.beta.threads.messages.list(thread.id)

        console.log(
            "------------------------------------------------------------ \n"
        )

        console.log("User: ", message.content[0].text.value);
        console.log("Assistant: ", allMessages.data[0].content[0].text.value)
    }
    waitForAssistantMessage()
}

main()