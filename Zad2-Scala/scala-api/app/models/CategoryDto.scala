package models
import play.api.libs.json.{Json, Format}
case class CategoryDto(name: String)
object CategoryDto {
  implicit val format: Format[CategoryDto] = Json.format[CategoryDto]
}