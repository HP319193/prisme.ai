# Creating a Transformative Gen.AI Chatbot for your website using RAG Architecture

Unlock the potential of your website by integrating a state-of-the-art Gen.AI chatbot powered by Retriever-Augmented Generation (RAG) architecture. This advanced chatbot goes beyond traditional interactions, offering a dynamic and conversational AI experience similar to ChatGPT. Through this guide, you'll learn how to transform your website into an interactive hub, where users can engage in meaningful dialogues and obtain information seamlessly as if they were conversing with ChatGPT itself.

<div style="position: relative; padding-bottom: 64.63195691202873%; height: 0;">
    <iframe src="https://www.loom.com/embed/39a5c713c6f4436ab30de3ad6fde4cb8?sid=e0d47a18-de28-4768-8329-018228539d2d" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>

## Getting Started with the Builder

First, head to the Prisme.ai Studio builder. Here, you'll find several project suggestions. Look for the "GenAI website chatbot" option and click on "duplicate." This action creates your workspace and automatically directs you to the activity feed, which logs all actions within the workspace.

## Navigating Your Workspace

After creating your workspace, it's time to get familiar with its features:
- Expand the sidebar to view Pages and automations created.
- Navigate to  Apps, where you'll find several applications already installed, but our focus will be on the "crawler."

## Setting Up the Crawler

The crawler is a crucial app for our chatbot, designed to inspect your website and process its content through AI.
- In the "Crawler" configurations, input the URL of the website you want the chatbot to read. For this tutorial, we'll use the Prisme.ai documentation's URL.
- After saving the URL, visit the "Crawler" page under "Pages" to view the current status of the website crawling. Initially, it might show no content, but given some time, you'll start seeing the crawled pages.

## Interacting with the Chat UI

Once the crawler has processed some pages:

- Move to the Chat page, where you can directly ask questions about the content of your website.

- If unsure what to ask, explore the Prisme.ai hub for AI knowledge, accessible from the sidebar. This area showcases your latest AI project and the documents available for querying.

## Crafting Queries

With the AI project selected:

- Choose a document to query. For demonstration, select a document and note down any folders or workspaces mentioned within.

- Use this information to ask your chatbot a question, such as "Which folders contain workspaces?"

## Integrating the Chatbot into Your Website

To embed the chatbot:

- Navigate to the "Widget" page where you'll see the chat icon.

- By editing the widget settings, you can customize aspects like the background color or the chat icon. For instance, changing the close icon color to red. You have access to CSS for more advanced customization.

- To integrate the chatbot into your website, copy the provided script from the widget's setup page and paste it into your website's HTML.

## Optimizing your RAG

AI Knowledge transforms how teams interact with and manage their information repositories. At its core, a "project" within AI Knowledge acts as a dynamic knowledge base, encompassing a wide array of documents. These documents, ranging from files and web URLs to simple text inputs, are the fundamental units through which information is cataloged and made accessible. Their status—active, inactive, or pending—dictates their availability for query, enabling a fluid and responsive data management system. By allowing multiple users to create, read, update, or delete documents, AI Knowledge fosters a collaborative environment for information handling.

The system further breaks down documents into "chunks," optimizing them for query and retrieval. This segmentation process is finely tunable, with settings for chunk size and overlap adjustable to suit the specific needs of each document or project. Such granularity ensures that the AI has the context necessary for accurate information retrieval and response generation. The platform's intelligent design allows for the customization of query prompts and the application of self-queries, enhancing the precision of information retrieval and the relevance of the AI's responses to user inquiries.

AI Knowledge's sophisticated architecture extends beyond basic query functionalities, incorporating advanced features like embeddings, chunk management, and query enhancement settings. These features enable the platform to process and interpret complex queries with remarkable efficiency. Additionally, the platform supports dynamic code interpretation, allowing for an expanded range of queries and interactions. This comprehensive suite of tools and settings empowers users to tailor the AI's performance to their specific needs, ensuring that AI Knowledge remains a versatile and powerful tool for managing and leveraging vast amounts of information.

![RAG Architecture](https://prismeai-uploads-prod.oss.eu-west-0.prod-cloud-ocb.orange-business.com/wW3UZla/-PRT5DBRYcGqov5FvHnPQ.AI-Knowledge.png "RAG Architecture")

For those seeking to implement a specific RAG pipeline that leverages LlamaIndex or Langchain, we recommend utilizing the Webhook feature and Python Custom Code capabilities within the Builder or your own API. The Builder offers a managed solution for customizing and extending the functionality of your AI applications. A predefined template, designed to streamline the development of such pipelines, is readily available in the suggestions section of the Low-code Builder product. T


## Conclusion

By following these steps, you've successfully created a chatbot that reads and interacts with your website's content. This tool not only enhances user engagement but also provides a dynamic way to navigate and utilize your website's information. Remember, Prisme.ai Studio offers extensive customization options, allowing you to tailor the chatbot's appearance and functionality to match your site's design and user needs.