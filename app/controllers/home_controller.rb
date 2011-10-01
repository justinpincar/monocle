class HomeController < ApplicationController
  def index; end

  def ma
    accountId = params[:accountId]

    begin
      @account = Account.find(BSON::ObjectId.from_string(accountId))
    rescue BSON::InvalidObjectId
      render :file => 'public/400.html', :status => :bad_request
      return
    end

    @events = Event.all(@account.id)
  end
end
