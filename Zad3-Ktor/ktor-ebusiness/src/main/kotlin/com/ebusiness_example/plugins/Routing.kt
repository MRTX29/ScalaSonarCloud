package com.ebusiness_example.plugins

import com.ebusiness_example.MessageSender
import com.ebusiness_example.Categories
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.plugins.autohead.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Application.configureRouting() {
    var sharedMessage = "No message received yet"
    install(AutoHeadResponse)
    routing {
        get("/") {
            val messageSender = MessageSender()
            val webhookUrl = "https://discord.com/api/webhooks/1226146895173517372/unFhLtt5O0NkK3vlKikJ3_-S3AxWjJ_Uo4W5J_kaz2Wz08r5j8DLrpCqiJuizvFepVm8"
            val message = "Hello from Ktor!"
            messageSender.sendMessageToDiscord(webhookUrl, message)
            call.respondText("Message sent to Discord")
        }

        post("/message") {
            sharedMessage = call.receiveText()
            call.respondText("Received")
        }

        get("/message") {
            call.respondText("Last message received from discord: $sharedMessage")
        }

        get("/categories") {
            val categoryController = Categories()
            val categoryList = categoryController.getCategories()
            println("Categories: $categoryList")
            call.respond(HttpStatusCode.OK, categoryList)
        }

        get("/categories/{categoryName}") {
            val categoryName = call.parameters["categoryName"] ?: return@get call.respondText(
                    "Missing or incorrect category name",
                    status = HttpStatusCode.BadRequest
            )
            val categoryController = Categories()
            val products = categoryController.getProductsByCategory(categoryName)
            if (!products.isNullOrEmpty()) {
                call.respond(HttpStatusCode.OK, products)
            } else {
                call.respond(HttpStatusCode.NotFound, "No products found for category: $categoryName")
            }
        }
    }
}
