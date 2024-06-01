package controllers

import javax.inject.Inject
import javax.inject.Singleton
import play.api.mvc._
import play.api.libs.json._
import models.ProductDto
import models.Product
import models.CategoryDto
import models.Category
import scala.collection.mutable.ListBuffer

@Singleton
class ProductsController @Inject()(val controllerComponents: ControllerComponents) extends BaseController{

    // Define an internal list to be returned
    private val _products = new ListBuffer[Product]()

    // Initial state
    _products += Product(1, "IPad", 2000, Category(1, "Electronics"))
    _products +=  Product(2, "Coffee Maker", 500, Category(2, "Kitchen"))

    def showAllProducts = Action {
        if (_products.isEmpty) {
            NoContent
        } 
        else {
            Ok(Json.toJson(_products))
        }
    }

    def internalGetProductById(id: Int):Product = {
    _products.find(_.id == id) match {
      case Some(product) => product
      case None => null
    }
    }

    def getProductById(id: Int) = Action {
    _products.find(_.id == id) match {
      case Some(product) => Ok(Json.toJson(product))
      case None => NoContent
    }
    }

    def addProduct() = Action { implicit request => 
    val content = request.body 
    val jsonObject = content.asJson 
    val productItem: Option[ProductDto] = jsonObject.flatMap(Json.fromJson[ProductDto](_).asOpt)

    productItem match {
    case Some(newItem) =>
      val nextId = _products.map(_.id).max + 1
      val toBeAdded = Product(nextId, newItem.name, newItem.price, newItem.category)
      _products += toBeAdded
      Created(Json.toJson(toBeAdded))
    case None => BadRequest
    }
    }

    def updateProduct(id: Int) = Action { implicit request => 
    val content = request.body 
    val jsonObject = content.asJson 
    val productItem: Option[ProductDto] = jsonObject.flatMap(Json.fromJson[ProductDto](_).asOpt)

    productItem match {
    case Some(newItem) =>
      val toBeUpdated = Product(id, newItem.name, newItem.price, newItem.category)
      _products.indexWhere(_.id == id) match {
        case -1 => NotFound("Product not found")
        case index =>
          _products.update(index, toBeUpdated)
          Ok(Json.toJson(toBeUpdated))
      }
    case None => BadRequest
    }
    }

    def removeProduct(id: Int) = Action {
    _products.find(_.id == id) match {
      case Some(product) =>
        _products -= product
        Ok(s"Product with ID $id removed")
      case None => NotFound("Product not found")
    }
    }
}