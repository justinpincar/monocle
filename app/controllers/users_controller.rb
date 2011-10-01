class UsersController < ApplicationController
  before_filter :authenticate_account!

  def index
    @users = User.all(current_account.id)
  end
end
