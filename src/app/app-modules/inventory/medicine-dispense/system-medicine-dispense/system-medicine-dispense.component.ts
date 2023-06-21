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
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray } from '@angular/forms';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';

import { InventoryService } from './../../shared/service/inventory.service';
import { ConfirmationService } from './../../../core/services/confirmation.service';
import { DataStorageService } from './../../shared/service/data-storage.service';

import { ShowBatchItemComponent } from './show-batch-item/show-batch-item.component';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { log } from 'util';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { LanguageService } from 'app/app-modules/core/services/language.service';

@Component({
  selector: 'app-system-medicine-dispense',
  templateUrl: './system-medicine-dispense.component.html',
  styleUrls: ['./system-medicine-dispense.component.css']
})
export class SystemMedicineDispenseComponent implements OnInit {

  @Input('beneficaryDetail')
  beneficaryDetail: any;

  @Output() resetBeneficiaryDetail: EventEmitter<any> = new EventEmitter();

  systemDispenseForm: FormGroup;
  languageComponent: SetLanguageComponent;
  currentLanguageSet: any;

  constructor(private inventoryService: InventoryService,
    private confirmationService: ConfirmationService,
    private dataStorageService: DataStorageService,
    private router: Router,
    public http_service: LanguageService,
    private dialog: MdDialog,
    private fb: FormBuilder) { }

  ngOnInit() {
    this.systemDispenseForm = this.createSystemDispenseForm();
    this.fetchLanguageResponse();
  }

  initSystemDispenseMode() {
    let systemItemDispenseList = <FormArray>this.systemDispenseForm.controls['systemItemDispenseList'];
    systemItemDispenseList.push(this.initSystemDispense());
  }
  removeItem(i, itemForm: FormGroup) {
    let systemItemDispenseList = <FormArray>this.systemDispenseForm.controls['systemItemDispenseList'];
    console.log('systemItemDispenseList.length', systemItemDispenseList.length)
    if (systemItemDispenseList.length == 1 && !!itemForm) {
      this.systemDispenseForm.reset();
      console.log('here')
      // itemForm.patchValue({
      //   itemName: null,
      //   itemID: null,
      //   quantityInHand: null,
      //   quantityRequired: null
      // })
    } else {
      systemItemDispenseList.removeAt(i);
    }
  }

  checkValidity(systemDispenseForm: FormGroup) {
    let tempBatch = systemDispenseForm.value;
    if (tempBatch.quantityRequired) {
      return false;
    } else {
      return true;
    }
  }
  createSystemDispenseForm() {
    return this.fb.group({
      systemItemDispenseList: new FormArray([this.initSystemDispense()])
    })
  }

  initSystemDispense(): FormGroup {
    return this.fb.group({
      itemName: null,
      itemID: null,
      quantityInHand: null,
      quantityRequired: null,
    })
  }

  resetDependent(systemItemDispense?: FormGroup) {
    systemItemDispense.patchValue({
      itemID: null,
      quantityInHand: null,
      quantityRequired: null,
    })
  }

  createItemList() {
    let systemDispenseValue = this.systemDispenseForm.value;
    console.log('systemDispenseValue', systemDispenseValue);
    let itemList = [];
    systemDispenseValue.systemItemDispenseList.forEach((item) => {
      let itemObj = {
        "itemID": item.itemID,
        "quantity": item.quantityRequired
      }
      itemList.push(itemObj)
    })
    return itemList;
  }

  allocateBatch() {
    let itemList = this.createItemList();
    console.log('itemList', JSON.stringify(itemList, null, 4));
    this.inventoryService.allocateBatch(itemList).subscribe((response) => {
      if (response.statusCode == 200) {
        if (response.data.length > 0) {
          let itemBatchList = response.data
          this.openModalToShowBatchList(itemBatchList)
        } else {
          this.confirmationService.alert(this.currentLanguageSet.inventory.itembatchlistisempty, 'error');
        }
      } else {
        this.confirmationService.alert(response.errorMessage, 'error');
      }
    }, err => {
      this.confirmationService.alert(err, 'error');
    });
  }

  openModalToShowBatchList(itemBatchList) {
    let mdDialogRef: MdDialogRef<ShowBatchItemComponent> = this.dialog.open(ShowBatchItemComponent, {
      data: {
        batchList: itemBatchList,
        beneficaryDetail: this.beneficaryDetail
      },
      width: 0.8 * window.innerWidth + "px",
      panelClass: 'dialog-width',
      disableClose: false
    });
    mdDialogRef.afterClosed().subscribe((result) => {
      console.log('result', result);
      if (result) {
        console.log('resuklt', result);
        if (result.result) {
          console.log('result.result', result.result);
          if (result.result.statusCode == 200) {
            console.log('result.result.statusCode', result.result.statusCode)
            if (result.print != null && result.print == true) {
              const printableData = this.createPrintableData(result.issuedBatchList);
              this.dataStorageService.systemItemDispense = printableData;
              console.log('printableData', JSON.stringify(printableData,null,4));
              let uRL = 'systemItemDispense'
              this.router.navigate(['/inventory/dynamicPrint/', uRL])
            } else {
              this.confirmationService.alert(this.currentLanguageSet.inventory.savedsuccessfully, 'success');
              this.resetBeneficiaryDetails();
            }
          } else {
            this.confirmationService.alert(result.result.errorMessage, 'error');
          }
        }
      }
    }, err => {
      this.confirmationService.alert(err, 'error');
    });
  }

  resetForm() {
    console.log('here in ')
    let systemItemDispenseList = <FormArray>this.systemDispenseForm.controls['systemItemDispenseList'];
    let systemItemDispenseListLength = systemItemDispenseList.value.length;
    console.log('systemItemDispenseListLength', systemItemDispenseListLength)
    for (let i = 0; i > systemItemDispenseListLength; i++) {
      systemItemDispenseList.removeAt(0);
    }
    this.resetBeneficiaryDetails();
  }

  resetBeneficiaryDetails() {
    console.log('event', event);
    this.resetBeneficiaryDetail.emit();
  }

  createPrintableData(issuedBatchList) {
    let printableData = []
    let i = 0;
    issuedBatchList.forEach((dispenseItem) => {
      dispenseItem.itemBatchList.forEach((batch) => {
        console.log('batch', batch);
        i = i + 1;
        let dispensedItem = {
          'sNo': i,
          'itemName': dispenseItem.itemName,
          'batchNo': batch.batchNo,
          'expiryDate': moment(batch.expiryDate).format('DD-MM-YYYY'),
          'qod': batch.quantity
        }
        printableData.push(dispensedItem);
      })
    })
    console.log(JSON.stringify(this.beneficaryDetail, null, 4));
    let beneficaryDetail = Object.assign({ visitedDate: moment(this.beneficaryDetail.visitDate).format('DD-MM-YYYY') }, this.beneficaryDetail)

    let systemDispenseItem = Object.assign({}, { title: this.title }, { headerColumn: this.headerColumn }, { headerDetail: beneficaryDetail }, { columns: this.columns }, { printableData: printableData });
    return systemDispenseItem;
  }

  validateRequestedQuantity(stock: FormGroup) {
    let quantityInHand = stock.value.quantityInHand;
    let requestedQuantity = stock.value.quantityRequired;

    if (requestedQuantity <= 0) {
      this.confirmationService.alert(this.currentLanguageSet.inventory.quantitycannotbenegativeorzero);
      stock.controls['quantityRequired'].setValue(null);
    }
    else if (requestedQuantity > quantityInHand) {
      this.confirmationService.alert(this.currentLanguageSet.inventory.insufficientquantityinthisbatch);
      stock.controls['quantityRequired'].setValue(null);
    }
  }



  title = {
    modalTitle: 'System Dispense',
    headerTitle: 'Dispense Detail',
    tableTitle: 'Dispensed Item'
  }
  columns = [
    {
      "keyName": "sNo",
      "columnName": "S No."
    },
    {
      "keyName": "itemName",
      "columnName": "Item Name"
    },
    {
      "keyName": "batchNo",
      "columnName": "Batch No"
    },
    {
      "keyName": "expiryDate",
      "columnName": "Expiry Date"
    },
    {
      "keyName": "qod",
      "columnName": "Qty dispensed"
    },
  ]
  headerColumn = [
    {
      columnName: 'Name :',
      keyName: 'patientName',
    },
    {
      columnName: 'Beneficiary ID :',
      keyName: 'beneficiaryID',
    },
    {
      columnName: 'Gender :',
      keyName: 'gender',
    },
    {
      columnName: 'Age :',
      keyName: 'age',
    },
    {
      columnName: 'Visit ID :',
      keyName: 'visitID',
    },
    {
      columnName: 'Visit Date :',
      keyName: 'visitedDate',
    },
    {
      columnName: 'Doctor Name :',
      keyName: 'doctorName',
    },
    {
      columnName: 'Issued By :',
      keyName: 'createdBy',
    },
    {
      columnName: 'Reference :',
      keyName: 'reference',
    }
  ]

  // AV40085804 29/09/2021 Integrating Multilingual Functionality -----Start-----
  ngDoCheck() {
    this.fetchLanguageResponse();
  }

  fetchLanguageResponse() {
    this.languageComponent = new SetLanguageComponent(this.http_service);
    this.languageComponent.setLanguage();
    this.currentLanguageSet = this.languageComponent.currentLanguageObject;
  }
  // -----End------
}
