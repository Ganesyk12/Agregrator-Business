<script setup lang="ts">
import DoughnutChart from '@/dashboard/components/DoughnutChart.vue'
import RevenueChart from '@/dashboard/components/RevenueChart.vue'
</script>

<style scoped>
.tile_count .tile_stats_count {
  float: left;
  width: 20%;
  position: relative;
  min-height: 1px;
  padding: 0 15px;
}
@media (max-width: 1199px) {
  .tile_count .tile_stats_count {
    width: 33.33%;
  }
}
@media (max-width: 767px) {
  .tile_count .tile_stats_count {
    width: 50%;
  }
}
</style>

<template>
  <div class="row tile_count">
    <div class="tile_stats_count">
      <span class="count_top"><i class="fa fa-building"></i> Total Vendors</span>
      <div class="count">250</div>
      <span class="count_bottom"><i class="green">4% </i> From last Week</span>
    </div>
    <div class="tile_stats_count">
      <span class="count_top"><i class="fa fa-cube"></i> Total Packages</span>
      <div class="count">1,230</div>
      <span class="count_bottom"><i class="green"><i class="fa fa-sort-asc"></i>3% </i> From last Week</span>
    </div>
    <div class="tile_stats_count">
      <span class="count_top"><i class="fa fa-calendar"></i> Total Bookings</span>
      <div class="count green">567</div>
      <span class="count_bottom"><i class="green"><i class="fa fa-sort-asc"></i>34% </i> From last Week</span>
    </div>
    <div class="tile_stats_count">
      <span class="count_top"><i class="fa fa-users"></i> Total Users</span>
      <div class="count">2,315</div>
      <span class="count_bottom"><i class="green"><i class="fa fa-sort-asc"></i>34% </i> From last Week</span>
    </div>
    <div class="tile_stats_count">
      <span class="count_top"><i class="fa fa-star"></i> Reviews</span>
      <div class="count">7,325</div>
      <span class="count_bottom"><i class="green"><i class="fa fa-sort-asc"></i>34% </i> From last Week</span>
    </div>
  </div>

  <div class="row">
    <div class="col-md-12 col-sm-12 col-xs-12">
      <div class="x_panel">
        <div class="x_title">
          <h2>Revenue Overview <small>Monthly revenue graph</small></h2>
          <div class="clearfix"></div>
        </div>
        <div class="x_content">
          <div style="height: 300px; padding: 10px 0;">
            <RevenueChart />
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="row">
    <div class="col-md-4 col-sm-4 col-xs-12">
      <div class="x_panel tile fixed_height_320">
        <div class="x_title">
          <h2>Top Vendors</h2>
          <ul class="nav navbar-right panel_toolbox">
            <li>
              <a class="collapse-link"><i class="fa fa-chevron-up"></i></a>
            </li>
          </ul>
          <div class="clearfix"></div>
        </div>
        <div class="x_content">
          <div class="widget_summary">
            <div class="w_left w_25">
              <span>Vendor A</span>
            </div>
            <div class="w_center w_55">
              <div class="progress">
                <div class="progress-bar bg-green" role="progressbar" style="width: 85%"></div>
              </div>
            </div>
            <div class="w_right w_20">
              <span>85</span>
            </div>
            <div class="clearfix"></div>
          </div>
          <div class="widget_summary">
            <div class="w_left w_25">
              <span>Vendor B</span>
            </div>
            <div class="w_center w_55">
              <div class="progress">
                <div class="progress-bar bg-green" role="progressbar" style="width: 65%"></div>
              </div>
            </div>
            <div class="w_right w_20">
              <span>65</span>
            </div>
            <div class="clearfix"></div>
          </div>
          <div class="widget_summary">
            <div class="w_left w_25">
              <span>Vendor C</span>
            </div>
            <div class="w_center w_55">
              <div class="progress">
                <div class="progress-bar bg-green" role="progressbar" style="width: 45%"></div>
              </div>
            </div>
            <div class="w_right w_20">
              <span>45</span>
            </div>
            <div class="clearfix"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="col-md-4 col-sm-4 col-xs-12">
      <div class="x_panel tile fixed_height_320 overflow_hidden">
        <div class="x_title">
          <h2>Booking Status</h2>
          <ul class="nav navbar-right panel_toolbox">
            <li>
              <a class="collapse-link"><i class="fa fa-chevron-up"></i></a>
            </li>
          </ul>
          <div class="clearfix"></div>
        </div>
        <div class="x_content">
          <table class="" style="width: 100%">
            <tbody>
              <tr>
                <td>
                  <DoughnutChart />
                </td>
                <td>
                  <table class="tile_info">
                    <tbody>
                      <tr>
                        <td>
                          <p><i class="fa fa-square blue"></i>Pending</p>
                        </td>
                        <td>30%</td>
                      </tr>
                      <tr>
                        <td>
                          <p><i class="fa fa-square green"></i>Confirmed</p>
                        </td>
                        <td>45%</td>
                      </tr>
                      <tr>
                        <td>
                          <p><i class="fa fa-square purple"></i>Completed</p>
                        </td>
                        <td>15%</td>
                      </tr>
                      <tr>
                        <td>
                          <p><i class="fa fa-square red"></i>Cancelled</p>
                        </td>
                        <td>10%</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="col-md-4 col-sm-4 col-xs-12">
      <div class="x_panel tile fixed_height_320">
        <div class="x_title">
          <h2>Quick Actions</h2>
          <ul class="nav navbar-right panel_toolbox">
            <li>
              <a class="collapse-link"><i class="fa fa-chevron-up"></i></a>
            </li>
          </ul>
          <div class="clearfix"></div>
        </div>
        <div class="x_content">
          <div class="dashboard-widget-content">
            <ul class="quick-list">
              <li><i class="fa fa-building"></i><a href="#"> Add Vendor</a></li>
              <li><i class="fa fa-cube"></i><a href="#"> Add Package</a></li>
              <li><i class="fa fa-users"></i><a href="#"> Manage Users</a></li>
              <li><i class="fa fa-credit-card"></i><a href="#"> View Payments</a></li>
              <li><i class="fa fa-bar-chart"></i><a href="#"> Reports</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="row">
    <div class="col-md-12 col-sm-12 col-xs-12">
      <div class="x_panel">
        <div class="x_title">
          <h2>Recent Bookings</h2>
          <ul class="nav navbar-right panel_toolbox">
            <li>
              <a class="collapse-link"><i class="fa fa-chevron-up"></i></a>
            </li>
          </ul>
          <div class="clearfix"></div>
        </div>
        <div class="x_content">
          <table class="table table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Vendor</th>
                <th>Package</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>John Doe</td>
                <td>Vendor A</td>
                <td>Premium Package</td>
                <td><span class="label label-success">Completed</span></td>
                <td>Rp 5,000,000</td>
              </tr>
              <tr>
                <td>2</td>
                <td>Jane Smith</td>
                <td>Vendor B</td>
                <td>Basic Package</td>
                <td><span class="label label-warning">Pending</span></td>
                <td>Rp 1,500,000</td>
              </tr>
              <tr>
                <td>3</td>
                <td>Bob Johnson</td>
                <td>Vendor C</td>
                <td>Standard Package</td>
                <td><span class="label label-info">Confirmed</span></td>
                <td>Rp 3,000,000</td>
              </tr>
              <tr>
                <td>4</td>
                <td>Alice Brown</td>
                <td>Vendor A</td>
                <td>Enterprise Package</td>
                <td><span class="label label-danger">Cancelled</span></td>
                <td>Rp 10,000,000</td>
              </tr>
              <tr>
                <td>5</td>
                <td>Charlie Wilson</td>
                <td>Vendor B</td>
                <td>Premium Package</td>
                <td><span class="label label-success">Completed</span></td>
                <td>Rp 5,000,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
