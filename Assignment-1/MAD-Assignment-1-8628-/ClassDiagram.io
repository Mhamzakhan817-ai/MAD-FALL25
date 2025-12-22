@startuml

class User {
  +name : string
  +bio : string
  +skills : List<string>
}

class Offer {
  +id : string
  +title : string
  +desc : string
  +user : string
}

class LoginScreen {
  -email : string
  -password : string
  -error : string
  +handleLogin()
}

class HomeScreen {
  -offers : List<Offer>
}

class CreatePostScreen {
  -title : string
  -desc : string
  +handlePost()
}

class OfferDetailScreen {
  +offer : Offer
}

class ProfileScreen {
  +user : User
}

class ThemeContext {
  +isDark : boolean
  +toggleTheme()
  +themeStyles : object
}

class AppWrapper {
  +isDark : boolean
  +toggleTheme()
}

class App {
  +StackNavigator()
}

' Relationships
LoginScreen --> HomeScreen : navigates
HomeScreen --> OfferDetailScreen : navigates
HomeScreen --> CreatePostScreen : navigates
HomeScreen --> ProfileScreen : navigates
CreatePostScreen --> HomeScreen : returns new offer
OfferDetailScreen --> Offer : shows details
ProfileScreen --> User : displays
ThemeContext <.. AppWrapper : provides
AppWrapper --> App : contains navigation

@enduml
