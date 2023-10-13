/*
* AMRIT – Accessible Medical Records via Integrated Technology 
* Integrated EHR (Electronic Health Records) Solution 
*
* Copyright (C) "Piramal Swasthya Management and Research Institute" 
*
* This file is part of AMRIT.
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see https://www.gnu.org/licenses/.
*/
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CoreModule } from '../core/core.module';

import { DatepickerModule, BsDatepickerModule } from 'ngx-bootstrap/datepicker';


/*Components*/
import { InventoryRoutingModule } from './inventory-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { WorkareaComponent } from './workarea/workarea.component';
import { MedicineDispenseComponent } from './medicine-dispense/medicine-dispense.component';
import { ManualMedicineDispenseComponent } from './medicine-dispense/manual-medicine-dispense/manual-medicine-dispense.component';
import { SystemMedicineDispenseComponent } from './medicine-dispense/system-medicine-dispense/system-medicine-dispense.component';
import { StoreSelfConsumptionComponent } from './store-self-consumption/store-self-consumption.component';
import { PhysicalStockEntryComponent } from './physical-stock-entry/physical-stock-entry.component';
import { SelectBatchComponent } from './medicine-dispense/manual-medicine-dispense/select-batch/select-batch.component';
import { StoreStockTransferComponent } from './store-stock-transfer/store-stock-transfer.component';

/*Services*/
import { InventoryService } from './shared/service/inventory.service';
import {PrescribedDrugService} from './shared/service/prescribed-drug.service';
import { InventoryMasterService } from './shared/service/inventory-master.service';
import { DataStorageService } from './shared/service/data-storage.service';

import {
    ViewStoreSelfConsumptionComponent
} from './store-self-consumption/view-store-self-consumption/view-store-self-consumption.component';
import {
    ViewStoreSelfConsumptionDetailsComponent
} from './store-self-consumption/view-store-self-consumption/view-store-self-consumption-details/view-store-self-consumption-details.component';
import { ViewPhysicalStockComponent } from './physical-stock-entry/view-physical-stock/view-physical-stock.component';
import {
    ViewPhysicalStockDetailsComponent
} from './physical-stock-entry/view-physical-stock/view-physical-stock-details/view-physical-stock-details.component';
import { ViewMedicineDispenseComponent } from './medicine-dispense/view-medicine-dispense/view-medicine-dispense.component';
import {
    ViewMedicineDispenseDetailsComponent
} from './medicine-dispense/view-medicine-dispense/view-medicine-dispense-details/view-medicine-dispense-details.component';
import { ViewStoreStockTransferComponent } from './store-stock-transfer/view-store-stock-transfer/view-store-stock-transfer.component';
import {
    ViewStoreStockTransferDetailsComponent
} from './store-stock-transfer/view-store-stock-transfer/view-store-stock-transfer-details/view-store-stock-transfer-details.component';
import { ShowBatchItemComponent } from './medicine-dispense/system-medicine-dispense/show-batch-item/show-batch-item.component';
import { DynamicPrintComponent } from './dynamic-print/dynamic-print.component';
import { StoreStockAdjustmentComponent } from './store-stock-adjustment/store-stock-adjustment.component';
import { ViewStoreStockAdjustmentComponent } from './store-stock-adjustment/view-store-stock-adjustment/view-store-stock-adjustment.component';
import { ViewStoreStockAdjustmentDraftComponent } from './store-stock-adjustment/view-store-stock-adjustment-draft/view-store-stock-adjustment-draft.component';
import { ViewStockAdjustmentDraftDetailsComponent } from './store-stock-adjustment/view-stock-adjustment-draft-details/view-stock-adjustment-draft-details.component';
import { ViewStockAdjustmentDetailsComponent } from './store-stock-adjustment/view-stock-adjustment-details/view-stock-adjustment-details.component';
import { PatientReturnComponent } from './patient-return/patient-return.component';
import { PatientReturnBatchDetailsComponent } from './patient-return/patient-return-batch-details/patient-return-batch-details.component';
import { BenificiaryDetailsComponent } from './patient-return/benificiary-details/benificiary-details.component';
import { IndentOrderWorklistComponent } from './indent/indent-order-worklist/indent-order-worklist.component';
import { IndentRequestComponent } from './indent/indent-order-worklist/sub-store-indent-order-worklist/indent-request/indent-request.component';
import { ItemBatchDetailsForPatientReturnComponent } from './patient-return/item-batch-details-for-patient-return/item-batch-details-for-patient-return.component';
import { MainStoreIndentOrderWorklistComponent } from './indent/indent-order-worklist/main-store-indent-order-worklist/main-store-indent-order-worklist.component';
import { SubStoreIndentOrderWorklistComponent } from './indent/indent-order-worklist/sub-store-indent-order-worklist/sub-store-indent-order-worklist.component';
import { IndentDispensesComponent } from './indent/indent-order-worklist/main-store-indent-order-worklist/indent-dispenses/indent-dispenses.component';
import { SubStoreItemModelComponent } from './indent/indent-order-worklist/sub-store-indent-order-worklist/sub-store-item-model/sub-store-item-model.component';
import { MainStoreItemModelComponent } from './indent/indent-order-worklist/main-store-indent-order-worklist/main-store-item-model/main-store-item-model.component';
import { SelectBatchForIndentItemComponent } from './indent/indent-order-worklist/main-store-indent-order-worklist/indent-dispenses/manual-indent-dispense/select-batch-for-indent-item/select-batch-for-indent-item.component';
import { ManualIndentDispenseComponent } from './indent/indent-order-worklist/main-store-indent-order-worklist/indent-dispenses/manual-indent-dispense/manual-indent-dispense.component';
import { SystemIndentDispenseComponent } from './indent/indent-order-worklist/main-store-indent-order-worklist/indent-dispenses/system-indent-dispense/system-indent-dispense.component';
import { ShowIndentBatchDetailsComponent } from './indent/indent-order-worklist/main-store-indent-order-worklist/indent-dispenses/system-indent-dispense/show-indent-batch-details/show-indent-batch-details.component';
import { UtcDatePipe } from './utc-date.pipe';
import { InwardStockReportComponent } from './reports/inward-stock-report/inward-stock-report.component';
import { ConsumptionReportComponent } from './reports/consumption-report/consumption-report.component';
import { ExpiryReportComponent } from './reports/expiry-report/expiry-report.component';
import { BeneficiaryDrugIssueReportComponent } from './reports/beneficiary-drug-issue-report/beneficiary-drug-issue-report.component';
import { DailyStockDetailsReportComponent } from './reports/daily-stock-details-report/daily-stock-details-report.component';
import { DailyStockSummaryReportComponent } from './reports/daily-stock-summary-report/daily-stock-summary-report.component';
import { MonthlyReportComponent } from './reports/monthly-report/monthly-report.component';
import { YearlyReportComponent } from './reports/yearly-report/yearly-report.component';
import { RejectItemFromMainstoreModelComponent } from './indent/indent-order-worklist/main-store-indent-order-worklist/reject-item-from-mainstore-model/reject-item-from-mainstore-model.component';
import { PatientReturnPreviousRecordComponent } from './patient-return/patient-return-previous-record/patient-return-previous-record.component';
import { ShortExpiryReportComponent } from './reports/short-expiry-report/short-expiry-report.component';
import { TransitReportComponent } from './reports/transit-report/transit-report.component';

@NgModule({
    imports: [
        CommonModule,
        CoreModule,
        InventoryRoutingModule,
        ReactiveFormsModule,
        FormsModule,
        BsDatepickerModule.forRoot(),
        DatepickerModule.forRoot()
    ],
    entryComponents: [
        SelectBatchComponent,
        ViewStoreSelfConsumptionDetailsComponent,
        ViewPhysicalStockDetailsComponent,
        ViewMedicineDispenseDetailsComponent,
        ViewStoreStockTransferDetailsComponent,
        ShowBatchItemComponent,
        ShowIndentBatchDetailsComponent,
        ViewStockAdjustmentDetailsComponent,
        ViewStockAdjustmentDraftDetailsComponent,
        PatientReturnBatchDetailsComponent,
        BenificiaryDetailsComponent,
        SubStoreItemModelComponent,
        MainStoreItemModelComponent,
        SelectBatchForIndentItemComponent,
        RejectItemFromMainstoreModelComponent
    ],
    declarations: [
        DashboardComponent,
        WorkareaComponent,
        MedicineDispenseComponent,
        ManualMedicineDispenseComponent,
        SystemMedicineDispenseComponent,
        SelectBatchComponent,
        PhysicalStockEntryComponent,
        StoreSelfConsumptionComponent,
        StoreStockTransferComponent,
        ViewStoreSelfConsumptionComponent,
        ViewStoreSelfConsumptionDetailsComponent,
        ViewPhysicalStockComponent,
        ViewPhysicalStockDetailsComponent,
        ViewMedicineDispenseComponent,
        ViewMedicineDispenseDetailsComponent,
        ViewStoreStockTransferComponent,
        ViewStoreStockTransferDetailsComponent,
        ShowBatchItemComponent,
        DynamicPrintComponent,
        StoreStockAdjustmentComponent,
        ViewStoreStockAdjustmentComponent,
        ViewStoreStockAdjustmentDraftComponent,
        ViewStockAdjustmentDraftDetailsComponent,
        ViewStockAdjustmentDetailsComponent,
        PatientReturnComponent,
        PatientReturnBatchDetailsComponent,
        BenificiaryDetailsComponent,
        IndentOrderWorklistComponent,
        IndentRequestComponent,
        ItemBatchDetailsForPatientReturnComponent,
        MainStoreIndentOrderWorklistComponent,
        SubStoreIndentOrderWorklistComponent,
        IndentDispensesComponent,
        SubStoreItemModelComponent,
        MainStoreItemModelComponent,
        SelectBatchForIndentItemComponent,
        ManualIndentDispenseComponent,
        SystemIndentDispenseComponent,
        ShowIndentBatchDetailsComponent,
        UtcDatePipe,
        InwardStockReportComponent,
        ConsumptionReportComponent,
        ExpiryReportComponent,
        BeneficiaryDrugIssueReportComponent,
        DailyStockDetailsReportComponent,
        DailyStockSummaryReportComponent,
        MonthlyReportComponent,
        YearlyReportComponent,
        RejectItemFromMainstoreModelComponent,
        PatientReturnPreviousRecordComponent,
        ShortExpiryReportComponent,
        TransitReportComponent,
    ],
    providers: [
        InventoryService,
        InventoryMasterService,
        DataStorageService,
    ]
})
export class InventoryModule { }
