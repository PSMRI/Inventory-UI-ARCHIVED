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
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { BeneficiaryDetailsService } from '../../services/beneficiary-details.service';

import 'rxjs/Rx';
import { LanguageService } from '../../services/language.service';
import { SetLanguageComponent } from '../set-language.component';

@Component({
  selector: 'app-beneficiary-details',
  templateUrl: './beneficiary-details.component.html',
  styleUrls: ['./beneficiary-details.component.css']
})
export class BeneficiaryDetailsComponent implements OnInit {

  beneficiary: any;
  today: any;
  beneficiaryDetailsSubscription: any;
  currentLanguageSet: any;
  languageComponent: SetLanguageComponent;
  healthIDValue: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http_service : LanguageService,
    private beneficiaryDetailsService: BeneficiaryDetailsService
  ) { }

  ngOnInit() {
    this.today = new Date();
    this.healthIDValue=localStorage.getItem("healthID");
    this.route.params.subscribe(param => {
      this.beneficiaryDetailsService.getBeneficiaryDetails(param['beneficiaryRegID'], localStorage.getItem('benFlowID'));
      this.beneficiaryDetailsSubscription = this.beneficiaryDetailsService.beneficiaryDetails$
        .subscribe(res => {
          if (res != null) {
            this.beneficiary = res;
           if (res.serviceDate) {
             this.today = res.serviceDate;
           }
          }
        });

      this.beneficiaryDetailsService.getBeneficiaryImage(param['beneficiaryRegID'])
        .subscribe(data => {
          if (data && data.benImage) {
            this.beneficiary.benImage = data.benImage;
          }
        });
    });
    this.fetchLanguageResponse();
  }

  ngOnDestroy() {
    if (this.beneficiaryDetailsSubscription)
      this.beneficiaryDetailsSubscription.unsubscribe();
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
