package com.ebusiness_example

import kotlinx.serialization.*

class Categories {

    @Serializable
    data class Product(val name: String, val price: Double)

    @Serializable
    data class Category(val name: String)

    private val categories = listOf(
            Category("Books"),
            Category("Electronics"),
            Category("Clothes")
    )

    private val productsByCategory: Map<Category, List<Product>> = mapOf(
            Category("Books") to listOf(
                    Product("Dune", 32.99),
                    Product("Brave New World", 25.00)
            ),
            Category("Electronics") to listOf(
                    Product("Smartphone", 1580.00),
                    Product("Laptop", 3000.00)
            ),
            Category("Clothes") to listOf(
                    Product("T-shirt", 35.99),
                    Product("Jeans", 165.99)
            )
    )

    fun getCategories(): List<Category> {
        return categories
    }

    fun getProductsByCategory(categoryName: String): List<Product>? {
        return productsByCategory[categories.find { it.name == categoryName }]
    }
}