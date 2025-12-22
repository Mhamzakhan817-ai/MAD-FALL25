@startuml
left to right direction

actor User
actor Admin

rectangle SkillSwapApp {
  
  User --> (Login)
  User --> (View Skill Offers)
  User --> (View Offer Details)
  User --> (Create Skill Offer)
  User --> (View Profile)
  User --> (Toggle Dark/Light Theme)
  User --> (Logout)

  Admin --> (Remove Inappropriate Content)
  Admin --> (Manage User Accounts)
}

@enduml
