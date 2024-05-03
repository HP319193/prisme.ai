### Introduction to Test-Driven Development in AI Knowledge

In the rapidly evolving field of AI, maintaining a consistent and reliable development process is crucial. Test-Driven Development (TDD) within the AI Knowledge platform enables a collaborative environment where Data Scientists, Data Engineers, Developers, and Business Teams can work together efficiently. 

!!! info "Access"

    This unified approach ensures that everyone operates from a single source of truth, significantly enhancing efficiency and agility across teams.

#### Benefits of a Unified Development Approach

- **Efficiency**: By aligning all stakeholders around a shared set of tests and outcomes, teams can avoid duplicative work and miscommunications, speeding up the development cycle.
- **Agility**: With a shared understanding of objectives and metrics, teams can more rapidly adapt to changes in project scope or market demands without losing momentum.
- **Value Delivery**: Continuous integration of feedback through TDD allows teams to iteratively improve the product, ensuring that enhancements and optimizations directly address user needs and real-world performance.
- **Incremental Improvement**: As tests are run and re-run, they not only validate the AI’s performance but also guide further development, allowing for gradual enhancements that cumulatively lead to a superior product.

This approach not only streamlines project management and development but also underpins a culture of continuous improvement and cross-disciplinary collaboration, driving forward the development of robust and effective AI systems. By implementing TDD, organizations can foster a dynamic and responsive development environment, ultimately leading to faster delivery of high-value AI solutions.

## Creating an AI with RAG Specialization Using AI Knowledge

AI Knowledge allows for the effective management of a knowledge base by integrating various documents from sources like files, websites, and text into a unified system. This tutorial explains how to create an AI using the RAG architecture.

### Prerequisites

- Access to the AI Knowledge platform.
- Basic understanding of prompting.
- Documents or data to be integrated (web pages, PDFs, Word, PPT, JSON...).

### Step 1: Understand the AI Knowledge Interface

First, familiarize yourself with the AI Knowledge platform's architecture. It includes components like the Home > AI section, where you can manage your AI models, and tools for document integration, query handling, and customization.

- **Home**: Configure AI models , select embedding models, and set other parameters.

- **Test**: Configure Tests, supervize and analyze results

- **Analytics**: some KPI to monitor your AI usage: tokens, generated answers, daily usage... 

- **Docs**: Embeded product documentation.

### Step 2: Setting up Your Knowledge Base

Create a new project in AI Knowledge to organize your documents effectively.

1. **Log into AI Knowledge**: Access your dashboard.
2. **Create a wew Project**: Navigate to the project management area and create a new project for storing your knowledge base.

![Create project](https://prismeai-uploads-prod.oss.eu-west-0.prod-cloud-ocb.orange-business.com/zDIzJgZ/8Th-fkX-OgPCEtflsr2kU.Screenshot-2024-05-03-at-17.42.00.png "Create project")


### Step 3: Understand the AI Knowledge Architecture

![AI Knowledge architecture](https://prismeai-uploads-prod.oss.eu-west-0.prod-cloud-ocb.orange-business.com/wW3UZla/-PRT5DBRYcGqov5FvHnPQ.AI-Knowledge.png "AI Knowledge architecture")

This description provides an overview of the RAG (Retriever-Augmented Generation) architecture, as it is presented without necessitating any coding for the customization of your Large Language Model (LLM). The framework is deliberately designed to be indifferent to the specifics of LLMs, ensuring compatibility across various models for both embedding and generative tasks. It offers a flexible and adaptable solution for integrating LLMs into a wide range of applications.


### Step 4: Integrating Documents

To include web pages and PDFs into your knowledge base, follow these steps:

1. **Document Integration**: Use the system's interface to add documents from your selected sources.

![Adding doc](https://prismeai-uploads-prod.oss.eu-west-0.prod-cloud-ocb.orange-business.com/zDIzJgZ/778upsF0H0H9SqNXlU7cL.Screenshot-2024-05-03-at-17.44.56.png "Adding doc")

2. **Segmentation and Vectorization**: Documents are loaded, segmented into chunks, and vectorized with embedding model. This process involves settings adjustments such as:
   - **Text Splitter**: Choose between static or dynamic modes for document segmentation.
   - **Embeddings Settings**: Customize how text is transformed into vectors.

### Step 5: Querying the Knowledge Base

With your documents integrated, you can begin querying your knowledge base using the provided tools:

1. **Perform Queries**: Click on Chat to use the AI Store interface to chat across your integrated documents with ChatGPT Like interface.

![Chat](https://prismeai-uploads-prod.oss.eu-west-0.prod-cloud-ocb.orange-business.com/zDIzJgZ/Qi2YYaz5DXouem8lqcvdm.Screenshot-2024-05-03-at-17.57.12.png "Chat")

![Source and chuncks](https://prismeai-uploads-prod.oss.eu-west-0.prod-cloud-ocb.orange-business.com/zDIzJgZ/Jfx8GgfNuAGJuzUYmgvPC.Screenshot-2024-05-03-at-18.08.25.png "Source and chuncks")

!!! info "Access"

    As you can observe, sources are cited along with the option to view all chunks used to formulate the response. This feature allows you to thoroughly understand and challenge the AI's responses before making any decisions.


2. **Customize Query Handling**: Adjust settings like Self-Query and Enhance User Query to improve retrieval accuracy. 

!!! info "Access"

    Please note that this adds an additional call to the LLM, which may slow down response times and consume more tokens.

### Step 6: Implementing Test-Driven Development for AI Knowledge

After setting up your knowledge base and before proceeding to advanced customizations, it's crucial to integrate a test-driven approach to ensure your AI performs accurately and consistently over time.

#### Why Implement Test-Driven Development?

AI Knowledge supports automated testing, which is essential for:

- **Evaluating AI Performance**: Regularly assess the effectiveness of your AI in understanding and processing queries.
- **Quality Tracking and Observability**: Monitor changes in AI performance over time to detect and correct deviations or improvements.
- **Ease of Switching LLMs**: AI Knowledge is agnostic to the underlying Large Language Model (LLM). This flexibility allows you to switch to a more efficient, cost-effective, or environmentally friendly LLM without compromising on performance, thanks to robust testing.

#### Step-by-Step Guide to adding Automated Tests

1. **Access the Testing Module**: Navigate to the testing section in your AI Knowledge project settings.

2. **Create a New Test Suite**: Define a suite where you can group related tests, such as querying effectiveness or response accuracy.

![Add test](https://prismeai-uploads-prod.oss.eu-west-0.prod-cloud-ocb.orange-business.com/zDIzJgZ/uyPNr5rNMW2CJuNL-Lavk.Screenshot-2024-05-03-at-17.59.51.png "Add Test")


3. **Add Test Cases**: For each test case, input a set of questions with expected answers. These can range from simple factual inquiries to complex reasoning tasks that your AI should handle.

   Example of a test case:
   - **Question**: "What are the storage conditions for sensitive electronic components?"
   - **Expected Answer**: "Store in a cool, dry place away from sunlight."

4. **Configure Test Settings**: Set the frequency of test runs (e.g., daily) and specify whether they should be triggered automatically or manually.

5. **Running Tests**: Execute the tests to see how the AI responds. The platform automatically records and analyzes the performance.

#### Observing Test Results

For each test run, the following details are provided:

- **Prompt and Context**: View the exact prompt and context used by the AI for generating responses.
- **Generated Response**: The response from the AI is displayed.
- **Response Evaluation**: Each response is evaluated against the expected answer and rated as poor, correct, or good. This rating is color-coded for quick assessment.
- **Context Evaluation**: The relevance and accuracy of the context provided to the AI are also rated, ensuring the AI's understanding aligns with the query requirements.

![Test](https://prismeai-uploads-prod.oss.eu-west-0.prod-cloud-ocb.orange-business.com/zDIzJgZ/uXGiqIfxQayXuVQVIMMxg.Screenshot-2024-05-03-at-17.59.40.png "Test")

!!! info "Access"

    The business expert also has the option to manually assess the response, the context, and any instances of hallucination. This allows for monitoring the impact of optimizations made by the team. We recommend running tests after each modification to model, the prompt, AI parameters, chunk size, whether or not images are included, self-query, and so forth...

#### Continuous Improvement Based on Test Results

AI Knowledge leverages test results to automatically suggest prompt adjustments and other modifications to improve response accuracy. This proactive feature helps in:

- **Optimizing Interaction**: Refine how questions are presented to the AI to elicit the most accurate responses.
- **Enhancing AI Understanding**: Adjust the contextual information provided to the AI based on test feedback to improve comprehension and response relevance.

#### Integration into the AI Development Lifecycle

By incorporating this test-driven step, you ensure that your AI system not only meets the initial requirements but also adapts and improves over time, maintaining high standards of accuracy and reliability. This approach is crucial for organizations looking to leverage AI dynamically and sustainably in the face of evolving data and varying LLM capabilities.


### Step 7.1: Advanced customization using the Builder

For enhanced customization and to improve collaboration with business teams, such as developing specific RAG pipelines, utilize the Builder:

1. **Access the Builder**: Go to this feature on the Prisme.ai Platform.
2. **Implement Custom Code**: Use Python or NodeJS to incorporate specific functionalities with LLamaIndex or Langchain. Once you've set up the automation (making it accessible via URL), copy the URL and proceed to **Home > API & Webhook** on the platform. Here, enable the webhook and enter the automation URL. You can subscribe to notifications for actions like asked questions, and when documents are added, deleted, or updated, as well as for tests.

### Step 7.2: Advanced customization using your own hosted code 

You can link your AI Knowledge project to your externally hosted code using a Webhook. To achieve this, navigate to **Home > API & Webhook** on your platform to configure your URL and enhance your project with specific functionalities.

### Step 8: Monitoring and Maintenance

Regularly monitor your system to ensure optimal performance. Make adjustments to your knowledge base and AI settings as needed based on feedback and performance metrics. Use the Webhook feature to Implement alerting using the Builder to slack, Teams, ticketing system....

### Conclusion

By following these steps, you can effectively create and manage an AI with RAG capabilities using AI Knowledge. This setup allows for the efficient retrieval of information and customization of the AI to meet specific needs, enhancing your ability to manage and leverage data within your organization.

### Additional Resources

For further guidance, refer to AI Knowledge's Embeded documentation sections:

- **API References**: Learn how to interact with your knowledge base programmatically.

- **Webhook Documentation**: Discover how to set up specific automations that trigger when an end user asks a question, the business team manipulates documents, or when running tests.

- **Glossary**: Understand key terms and components used within the platform.

By the end of this tutorial, you should be able to create a specialized AI that leverages the power of RAG for enhanced information retrieval and knowledge management.