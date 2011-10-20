class MatrixController < ApplicationController
  before_filter :authenticate_account!

  def index; end

  def preload_data
    @blocks = Analytic.preload_matrix_blocks(current_account.id) || {}

    respond_to do |format|
      format.js { render :json => @blocks.to_json }
      format.html { render :json => @blocks.to_json }
    end
  end
end
