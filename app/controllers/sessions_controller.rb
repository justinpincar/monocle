class SessionsController < ApplicationController
  before_filter :authenticate_account!

  def index
    @sessions = Session.all(current_account.id)
  end

  def show
    @session = Session.find(current_account.id, params[:id])
  end
end
