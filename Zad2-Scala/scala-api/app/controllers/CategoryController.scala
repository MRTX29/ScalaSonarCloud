package controllers

import javax.inject.Inject
import javax.inject.Singleton
import play.api.mvc._
import play.api.libs.json._
import models.CategoryDto
import models.Category
import scala.collection.mutable.ListBuffer

@Singleton
class CategoryController @Inject()(val controllerComponents: ControllerComponents) extends BaseController{

    // Define an internal list to be returned
    private val _categories = new ListBuffer[Category]()

    // Initial state
    _categories += Category(1, "Electronics")
    _categories +=  Category(2, "Kitchen")

    def showAllCategories = Action {
        if (_categories.isEmpty) {
            NoContent
        } 
        else {
            Ok(Json.toJson(_categories))
        }
    }

    def getCategoryById(id: Int) = Action {
      _categories.find(_.id == id) match {
      case Some(category) => Ok(Json.toJson(category))
      case None => NoContent
    }
    }

    def addCategory() = Action { implicit request =>
    val content = request.body 
    val jsonObject = content.asJson 
    val productItem: Option[CategoryDto] = jsonObject.flatMap(Json.fromJson[CategoryDto](_).asOpt)

    productItem match {
    case Some(newItem) =>
      val nextId = _categories.map(_.id).max + 1
      val toBeAdded = Category(nextId, newItem.name)
      _categories += toBeAdded
      Created(Json.toJson(toBeAdded))
    case None => BadRequest
    }
    }

    def updateCategory(id: Int) = Action { implicit request =>
    val content = request.body 
    val jsonObject = content.asJson 
    val productItem: Option[CategoryDto] = jsonObject.flatMap(Json.fromJson[CategoryDto](_).asOpt)

    productItem match {
    case Some(newItem) =>
      val toBeUpdated = Category(id, newItem.name)
      _categories.indexWhere(_.id == id) match {
        case -1 => NotFound("Category not found")
        case index =>
          _categories.update(index, toBeUpdated)
          Ok(Json.toJson(toBeUpdated))
      }
    case None => BadRequest
    }
    }

    def removeCategory(id: Int) = Action {
      _categories.find(_.id == id) match {
      case Some(category) =>
        _categories -= category
        Ok(s"Category with ID $id removed")
      case None => NotFound("Category not found")
    }
    }
}