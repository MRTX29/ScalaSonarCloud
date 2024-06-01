package models
import play.api.libs.json.{Json, Format}
case class OrderDto(id: Int)
object OrderDto {
  implicit val format: Format[OrderDto] = Json.format[OrderDto]
}