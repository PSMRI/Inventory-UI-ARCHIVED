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
import { Component, OnInit, ViewChild, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { environment } from 'environments/environment';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { ConfirmationService } from '../../services/confirmation.service';
import { CommonService } from '../../services/common-services.service';
import { InventoryService } from '../../../inventory/shared/service/inventory.service';
import { SetLanguageComponent } from '../set-language.component';
import { LanguageService } from '../../services/language.service';

interface Beneficary {
  firstName: string;
  lastName: string;
  gender: string;
  stateID: string;
  districtID: string;
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {


  beneficiary: Beneficary;
  genders = [];
  states = [];
  districts = [];
  stateID: any;
  districtID: any;
  countryId = environment.countryId;
  searched: Boolean = false;
  beneficiaryList = [];
  filteredBeneficiaryList = [];
  blankTable = [{}, {}, {}, {}, {}];

  @ViewChild('newSearchForm') form: any;
  languageComponent: SetLanguageComponent;
  currentLanguageSet: any;

  constructor(private confirmationService: ConfirmationService,
    public mdDialogRef: MdDialogRef<SearchComponent>, private commonService: CommonService,
    public http_service: LanguageService,
    private changeDetectorRef: ChangeDetectorRef, private inventoryService: InventoryService) { }

  ngOnInit() {
    this.createBeneficiaryForm();
    this.callForMasterData();
    this.fetchLanguageResponse();

    // this.getStates();
    // this.getStatesData(); //to be called from masterobservable method layter
  }


  AfterViewChecked() {
    this.changeDetectorRef.detectChanges();

  }

  callForMasterData() {
    this.commonService.getRegistrationData()
      .subscribe((res) => {
        if (res && res.statusCode == 200 && res.data) {
          console.log(res)
          this.genders = res.data.m_genders;
          this.states = res.data.states;
        } else {
          this.mdDialogRef.close(false);
        }
      })
  }

  onStateChange() {
    this.beneficiary.districtID = null;

    this.commonService.getStateDistricts(this.beneficiary.stateID)
      .subscribe((res) => {
        if (res && res.data && res.statusCode == 200) {
          console.log(res)
          this.districts = res.data;
        } else {
          this.mdDialogRef.close(false);
        }
      })

  }

  createBeneficiaryForm() {
    this.beneficiary = {
      firstName: null,
      lastName: null,
      gender: null,
      stateID: null,
      districtID: null
    }
  }

  resetBeneficiaryForm() {
    this.form.reset();
    this.beneficiaryList = [];
    this.filteredBeneficiaryList = [];
    this.searched = false;
    // this.getStatesData()
  }


  getSearchResult() {
    const dataObj = {
      firstName: this.beneficiary.firstName,
      lastName: this.beneficiary.lastName,
      genderID: this.beneficiary.gender,
      providerServiceMapID: localStorage.getItem('providerServiceID'),
      i_bendemographics: {
        stateID: this.beneficiary.stateID,
        districtID: this.beneficiary.districtID
      }
    }

    this.commonService.searchBeneficiary(dataObj)
      .subscribe(beneficiaryList => {
        if (!beneficiaryList || !beneficiaryList.data || beneficiaryList.data.length <= 0) {
          this.beneficiaryList = [];
          this.filteredBeneficiaryList = [];
          this.searched = true;
        } else {
          this.beneficiaryList = this.searchRestruct(beneficiaryList.data, {});
          this.filteredBeneficiaryList = this.beneficiaryList;
          this.searched = true;
          console.log(this.beneficiaryList, this.filteredBeneficiaryList)
        }
        // console.log(JSON.stringify(beneficiaryList.data, null, 4));
      }, error => {
        this.confirmationService.alert(error, 'error');
      });
  }

  /**
   * ReStruct the response object of Identity Search to be as per search table requirements
   */
  searchRestruct(benList, benObject) {
    const requiredBenData = [];
    benList.forEach((element, i) => {
      requiredBenData.push({
        beneficiaryID: element.beneficiaryID,
        beneficiaryRegID: element.beneficiaryRegID,
        benName: `${element.firstName} ${element.lastName || ''}`,
        genderName: `${element.m_gender.genderName || 'Not Available'}`,
        fatherName: `${element.fatherName || 'Not Available'}`,
        districtName: `${element.i_bendemographics.districtName || 'Not Available'}`,
        villageName: `${element.i_bendemographics.districtBranchName || 'Not Available'}`,
        phoneNo: this.getCorrectPhoneNo(element.benPhoneMaps, benObject),
        age: element.dOB,
        registeredOn: element.createdDate,
      })

    })
    console.log(JSON.stringify(requiredBenData, null, 4), 'yoooo!')

    return requiredBenData;

  }
  getCorrectPhoneNo(phoneMaps, benObject) {
    let phone;
    if (benObject && !benObject && !benObject.phoneNo) {
      return phoneMaps[0].phoneNo;
    } else if (benObject && !benObject && !benObject.phoneNo && !phoneMaps.length) {
      return phoneMaps[0].phoneNo || 'Not Available';
    } else if (benObject && benObject.phoneNo && phoneMaps.length > 0) {
      phoneMaps.forEach(elem => {
        if (elem.phoneNo == benObject.phoneNo) {
          phone = elem.phoneNo;
        }
      })
      if (phone) {
        return phone;

      } else if (phoneMaps.length > 0) {
        return phoneMaps[0].phoneNo;
      } else {
        return 'Not Available'
      }

    } else if (phoneMaps.length > 0) {
      return phoneMaps[0].phoneNo;
    } else {
      return 'Not Available';
    }
  }


  checkVisit(benID) {
    if (benID) {
    this.inventoryService.getBeneficaryVisitDetail({"providerServiceMapID":localStorage.getItem('providerServiceID'),beneficiaryID: benID})
    .subscribe(res => {
      if (res && res.statusCode == 200 && res.data) {
          if (res.data.benVisitDetail && res.data.benVisitDetail.length) {
            this.mdDialogRef.close(benID);
          } else {
            this.confirmationService.alert(this.currentLanguageSet.inventory.NoVisitRecordFoundForThisBeneficiary, 'info');
          }
      } else {
        this.confirmationService.alert(this.currentLanguageSet.inventory.NoVisitRecordFoundForThisBeneficiary, 'info');
      }
    })
    }
  }
  
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
