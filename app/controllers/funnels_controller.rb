class FunnelsController < ApplicationController
  before_filter :authenticate_account!

  def index
    @funnels = Funnel.all(current_account.id)
  end

  def new
    @events = Event.all(current_account.id)
  end

  def create
    funnel = Funnel.build(params[:funnel])
    funnel.save(current_account.id)

    redirect_to funnel_path(funnel._id)
  end

  def show
    @funnel = Funnel.find(current_account.id, params[:id])
  end

  def edit
    @funnel = Funnel.find(current_account.id, params[:id])
    @events = Event.all(current_account.id)
  end

  def update
    funnel = Funnel.find(current_account.id, params[:id])
    funnel.update(params[:funnel])
    funnel.save(current_account.id)

    redirect_to funnel_path(funnel._id)
  end

  def destroy
    @funnel = Funnel.find(current_account.id, params[:id])
    @funnel.destroy(current_account.id)

    redirect_to funnels_path
  end
end
