class AccountsController < ApplicationController
  def show
    load_account
  end

  def new
    @account = Account.new
  end

  def create
    @account = Account.new(params[:account])
    if @account.valid? and @account.save?
      flash[:notice] = "Account created."
      redirect_to monocle_path
    else
      flash[:notice] = "Errors."
      render :action => 'new'
    end
  end

  def edit
    load_account
  end

  def update
    load_account

    if @account.update_attributes(params[:account])
      redirect_to(@account, :notice => 'Account was successfully updated.')
    else
      render :action => "edit"
    end
  end

  private

  def load_account
    @account = Account.find(params[:id])
  end
end
