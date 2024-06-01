package models
import play.api.libs.json.{Json, Format}

case class ProductDto(name: String, price: Double, category: Category)

object ProductDto {
  implicit val format: Format[ProductDto] = Json.format[ProductDto]
}