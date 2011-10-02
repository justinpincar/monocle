class AccountsController < ApplicationController
  before_filter :authenticate_account!

  def show
    load_account
  end

  private

  def load_account
    @account = Account.find(current_account.id)
  end
end
