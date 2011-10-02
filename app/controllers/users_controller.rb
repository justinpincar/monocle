class UsersController < ApplicationController
  before_filter :authenticate_account!

  def index
    @users = User.all(current_account.id)
  end

  def show
    @user = User.find(current_account.id, params[:id])
  end
end
