class Account
  include MongoMapper::Document
  plugin MongoMapper::Devise

  devise :database_authenticatable, :registerable, :recoverable, :rememberable, :trackable, :validatable

  attr_accessible :id, :email, :password, :remember_me
end
