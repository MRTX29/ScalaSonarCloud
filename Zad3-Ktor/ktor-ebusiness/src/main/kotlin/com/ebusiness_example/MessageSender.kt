package com.ebusiness_example

import io.ktor.client.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
class MessageSender
{
    suspend fun sendMessageToDiscord(webhookUrl: String, message: String)
    {
        val client = HttpClient()
        {
            install(ContentNegotiation)
            {
                json()
            }
        }

        try
        {
            val response: HttpResponse = client.post(webhookUrl)
            {
                contentType(ContentType.Application.Json)
                setBody(mapOf("content" to message))
            }

            if (!response.status.isSuccess())
            {
                println("Failed to send message to Discord. Status: ${response.status}")
            }
        }
        catch (e: Exception)
        {
            println("Error sending message to Discord: ${e.message}")
        }
        finally
        {
            client.close()
        }
    }
}