package models
import play.api.libs.json.{Json, Format}
case class Category(id: Int, name: String)
object Category {
  implicit val format: Format[Category] = Json.format[Category]
}