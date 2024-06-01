package models
import play.api.libs.json.{Json, Format}

case class Product(id: Int, name: String, price: Double, category: Category)

object Product {
  implicit val format: Format[Product] = Json.format[Product]
}