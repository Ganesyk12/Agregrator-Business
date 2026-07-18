<script setup lang="ts">
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
      <span class="count_top"><i class="fa fa-money"></i> Total Revenue</span>
      <div class="count">Rp 2,5 M</div>
      <span class="count_bottom"><i class="green">12% </i> From last Month</span>
    </div>
    <div class="tile_stats_count">
      <span class="count_top"><i class="fa fa-check-circle"></i> Paid</span>
      <div class="count green">Rp 1,8 M</div>
      <span class="count_bottom"><i class="green"><i class="fa fa-sort-asc"></i>8% </i> From last Month</span>
    </div>
    <div class="tile_stats_count">
      <span class="count_top"><i class="fa fa-clock-o"></i> Pending</span>
      <div class="count">Rp 450 Jt</div>
      <span class="count_bottom"><i class="green"><i class="fa fa-sort-asc"></i>5% </i> From last Month</span>
    </div>
    <div class="tile_stats_count">
      <span class="count_top"><i class="fa fa-times-circle"></i> Failed</span>
      <div class="count red">Rp 250 Jt</div>
      <span class="count_bottom"><i class="red"><i class="fa fa-sort-desc"></i>3% </i> From last Month</span>
    </div>
    <div class="tile_stats_count">
      <span class="count_top"><i class="fa fa-percent"></i> Commission</span>
      <div class="count">Rp 375 Jt</div>
      <span class="count_bottom"><i class="green"><i class="fa fa-sort-asc"></i>10% </i> From last Month</span>
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
</template>
