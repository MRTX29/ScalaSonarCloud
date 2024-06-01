package controllers

import javax.inject.Inject
import javax.inject.Singleton
import play.api.mvc._
import play.api.libs.json._
import models.Product
import models.Category
import models.OrderDto
import models.Order
import scala.collection.mutable.ListBuffer
import scala.collection.mutable.Map

@Singleton
class CartController @Inject()(val controllerComponents: ControllerComponents, val availableProducts: ProductsController) extends BaseController{

  private val _order = Order(new ListBuffer[Product])

    def addToCart() = Action { implicit request =>
      val content = request.body
      val jsonObject = content.asJson
      val productItem: Option[OrderDto] = jsonObject.flatMap(Json.fromJson[OrderDto](_).asOpt)

      productItem match {
        case Some(newItem) =>
          val toBeAdded = availableProducts.internalGetProductById(newItem.id)
          if (toBeAdded == null) {
            NoContent
          }
          else {
            _order.items += toBeAdded
            Ok(Json.toJson(_order))
          }
        case None => BadRequest
      }
    }

    def removeFromCart(id: Int) = Action {
      val toBeRemoved = availableProducts.internalGetProductById(id)
      if (toBeRemoved == null) {
        NoContent
      }
      else {
        _order.items -= toBeRemoved
        Ok(Json.toJson(_order))
      }
    }
}