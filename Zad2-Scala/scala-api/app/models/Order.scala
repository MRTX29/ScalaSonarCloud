package models
import play.api.libs.json.{Json, Format}
import scala.collection.mutable.ListBuffer
case class Order(items: ListBuffer[Product])
object Order {
  implicit val format: Format[Order] = Json.format[Order]
}