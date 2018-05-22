import { Component, OnInit, Inject, ElementRef, OnDestroy, Input, EventEmitter, Output } from '@angular/core';
import { UtilitiesService } from 'app/services/utilities.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ChillerPlantService } from '../api-service/chiller-plant.service';
import { PerformanceCurveService } from '../api-service/performance-curve.service';

import * as _ from 'lodash';
import * as cytoscape from 'cytoscape';
import * as edgehandles from 'cytoscape-edgehandles';
import * as contextMenus from 'cytoscape-context-menus';
import { find } from 'rxjs/operator/find';
import { MESSAGE, VARIABLES } from '../constant';
import { DataDefault } from '../model/plant-model';
import { LocalMessages } from '../message';
import { ValidateService } from 'app/services/validate.service';
import { SharedService } from "../services/shared-service.service";
import * as FileSaver from 'file-saver';
import * as $ from 'jquery';


@Component({
  selector: 'plant-model',
  templateUrl: './plant-model.component.html',
  styleUrls: ['./plant-model.component.scss']
})
export class PlantModelComponent implements OnInit {
  @Output('isChanged') isChanged = new EventEmitter<boolean>();
  emitChangeValue(value) {
    this.isChanged.emit(value);
  }

  @Input('idSelected') chillerPlantId: number;
  cy: any;
  dragEvent: any = null;
  updateData: any = {};
  outLine = {};
  isDisabledExport = false;
  isDrawModeOn = false;
  statusDrawModel = 'Off';

  curCT = 0;
  curCCT = 0;
  curChiller = 0;
  curCDWP = 0;
  curCHWP = 0;

  dataModels: any;
  dataDefault = new DataDefault();
  dataNodes: any[] = [];
  dataEdges: any[] = [];
  dataModelOld: any;
  listName: any;
  constructor(
    private sharedService: SharedService,
    private _UtilitiesService: UtilitiesService,
    public dialog: MatDialog,
    private chillerPlantService: ChillerPlantService
  ) {
  }
  ngOnInit() {
  }
  ngOnDestroy() {
    $('.setPosContextMenu').css({
      'display': 'none',
    })
    // unsubscribe to ensure no memory leaks
    this.sharedService.setData(VARIABLES.DATA_CHANGED, false);
  }

  // run after view show
  ngAfterViewInit() {
    this._UtilitiesService.showLoading();
    this.reloadData().then(() => {
      this.getDefaultTable();
      setTimeout(() => {
        this.reloadPlantModel();
        this._UtilitiesService.hideLoading();
      }, 300);
      // if (!document.getElementById('cy')) {
      //   setTimeout(() => {
      //     this.reloadPlantModel();
      //   }, 500);
      // } else {
      //   this.reloadPlantModel();
      // }
    }).catch((err) => {
      this._UtilitiesService.stopLoading();
    });
  }
  // reload Data on server
  reloadData() {
    const request = {
      id: this.chillerPlantId
    };
    return this.chillerPlantService.getChillerPlantDetail(request).then(result => {
      if (result) {
        this.dataModels = result;
        this.initData();
      }
    }, error => {
      if (error) {
        this._UtilitiesService.showErrorAPI(error, null);
      }
    });
  }
  // get default data of equipment
  getDefaultTable() {
    const request = {};
    return this.chillerPlantService.getDefaultValue(request).then(result => {
      if (result) {
        // this.dataDefault = result.content;
        this.initDefaultData(result.content);
      }
    }, error => {
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }
  // init dataDefault
  initDefaultData(data) {
    _.forEach(data, (item) => {
      let idItem = item['id'];
      switch (idItem) {
        case 1: this.dataDefault.conversionFactorFromRtToKw = item['value']; break;
        case 2: this.dataDefault.conversionFactorForChiller = item['value']; break;
        case 3: this.dataDefault.waterHeatCapacity = item['value']; break;
        case 4: this.dataDefault.conversionFactorForCTCapacity = item['value']; break;
        case 5: this.dataDefault.conversionFactorWaterFlowRate = item['value']; break;
        case 6: this.dataDefault.conversionFactorAirVolume = item['value']; break;
        case 7: this.dataDefault.enteringChilledWaterTemp = item['value']; break;
        case 8: this.dataDefault.leavingChilledWaterTemp = item['value']; break;
        case 9: this.dataDefault.enteringCondenserWaterTemp = item['value']; break;
        case 10: this.dataDefault.leavingCondenserWaterTemp = item['value']; break;
        case 11: this.dataDefault.headProportionalFactor = item['value']; break;
        case 12: this.dataDefault.maxFlowRateRatio = item['value']; break;
        case 13: this.dataDefault.minFlowRateRatio = item['value']; break;
        case 14: this.dataDefault.outdoorWetBulbTemp = item['value']; break;
        case 15: this.dataDefault.maxAirVolume = item['value']; break;
        case 16: this.dataDefault.minAirVolume = item['value']; break;
        case 17: this.dataDefault.ratedFreq = item['value']; break;
        // inputPower 
        // waterFlowRate
        // airVolume
      }
      this.dataDefault.inputPower = 0;
      this.dataDefault.waterFlowRate = 0;
      this.dataDefault.airVolume = 0;
    });
  }
  // init position for chiller add cct with chiller plant create new
  initPosition() {
    this.dataModels.chillers.forEach(item => {
      if (!item.posX || !item.posY) {
        item.posX = 0;
        item.posY = 0;
      }
    });
    this.dataModels.ccts.forEach((item, index) => {
      if (!item.posX || !item.posY) {
        item.posX = -100;
        item.posY = 200 * index;
      }
    });
  }
  // reload model
  initData() {
    this.initPosition();
    this.initID();
    this.isDisabledExport = !this.dataModels.completeStatus;
    this.dataModelOld = _.cloneDeep(this.dataModels);
  }
  // init list EquipmentName
  initListNameEquipment() {
    this.listName = [];
    this.dataNodes.forEach((item) => {
      if (item.data.name) {
        this.listName.push(item.data.name);
      }
    });
  }
  // init id for create new
  initID() {
    if (!_.isEmpty(this.dataModels.ccts)) {
      const maxId = _.maxBy(this.dataModels.ccts, function (o) {
        return o['id'];
      })['id'];
      if (maxId > this.curCCT) {
        this.curCCT = maxId;
      }
      this.dataModels.ccts.forEach((item) => {
        if (!_.isEmpty(item.coolingTowers)) {
          const maxId = _.maxBy(item.coolingTowers, function (o) {
            return o['id'];
          })['id'];
          if (maxId > this.curCT) {
            this.curCT = maxId;
          }
        }
      });
    }
    if (!_.isEmpty(this.dataModels.bkCts)) {
      const maxId = _.maxBy(this.dataModels.bkCts, function (o) {
        return o['id'];
      })['id'];
      if (maxId > this.curCT) {
        this.curCT = maxId;
      }
    }
    if (!_.isEmpty(this.dataModels.chillers)) {
      const maxChiller = _.maxBy(this.dataModels.chillers, function (o) {
        return o['id'];
      });
      const maxIdChiller = maxChiller['id'];
      const maxIdCDWP = maxChiller['condenserWaterPump'].id;
      const maxIdCHWP = maxChiller['chillerWaterPump'].id;
      if (maxIdChiller > this.curChiller) {
        this.curChiller = maxIdChiller;
      }
      if (maxIdCDWP > this.curCDWP) {
        this.curCDWP = maxIdCDWP;
      }
      if (maxIdCHWP > this.curCHWP) {
        this.curCHWP = maxIdCHWP;
      }
    }

    if (!_.isEmpty(this.dataModels.bkCdwps)) {
      const maxId = _.maxBy(this.dataModels.bkCdwps, function (o) {
        return o['id'];
      })['id'];
      if (maxId > this.curCDWP) {
        this.curCDWP = maxId;
      }
    }
    if (!_.isEmpty(this.dataModels.bkChwps)) {
      const maxId = _.maxBy(this.dataModels.bkChwps, function (o) {
        return o['id'];
      })['id'];
      if (maxId > this.curCHWP) {
        this.curCHWP = maxId;
      }
    }
  }
  reloadPlantModel() {
    if (1) {
      this.dataNodes = [];
      this.dataEdges = [];
      // update index for equipment
      this.onDataChange();
      this.cy = cytoscape({
        container: document.getElementById('cy'),
        elements: this.prepareData(),
        style: this.parepareStyle(),
        layout: {
          name: 'preset'
        },
        'wheelSensitivity': 0.2,
        'minZoom': 0.17,
        'maxZoom': 1.75
      });
      this.iniEdgehandles();
      this.onClickOnNode();
      this.fitModel();
      this.hoverNode();
      this.blockMoveNode();
      this.initRightClickMenu();
      this.updatePosition();
      this.initListNameEquipment();
    }
  }
  // init prepare data for cytocape
  prepareData() {
    let prepareData = [];
    // prepare data ccts
    if (!_.isEmpty(this.dataModels.ccts)) {
      for (let i = 0; i < this.dataModels.ccts.length; i++) {
        this.dataNodes.push({
          group: 'nodes',
          data: {
            id: 'cct-' + this.dataModels.ccts[i].id,
            simulatorIndex: this.dataModels.ccts[i].simulatorIndex,
            name: this.dataModels.ccts[i].cctName,
            type: 'cct'
          },
          position: {
            x: this.dataModels.ccts[i].posX,
            y: this.dataModels.ccts[i].posY
          },
          classes: 'show-remove'
        });
        // positon of cooling tower
        let positionCT = {
          x: this.dataModels.ccts[i].posX,
          y: this.dataModels.ccts[i].posY
        };
        for (let j = 0; j < this.dataModels.ccts[i].coolingTowers.length; j++) {
          // config position of cooling tower
          if (j == 0) {
            // y -= 150;
          } else {
            if (j % 2 == 0) {
              positionCT.x -= 130;
              positionCT.y += 130;
            } else {
              positionCT.x += 130;
            }
          }
          this.dataNodes.push({
            group: 'nodes',
            data: {
              id: 'ct-' + this.dataModels.ccts[i].coolingTowers[j].id,
              simulatorIndex: this.dataModels.ccts[i].coolingTowers[j].simulatorIndex,
              name: this.dataModels.ccts[i].coolingTowers[j].ctName,
              parent: 'cct-' + this.dataModels.ccts[i].id,
              type: 'ct',
              waterFlowRate: this.dataModels.ccts[i].coolingTowers[j].waterFlowRate,
              outdoorWetBulbTemp: this.dataModels.ccts[i].coolingTowers[j].outdoorWetBulbTemp,
              airVolume: this.dataModels.ccts[i].coolingTowers[j].airVolume,
              maxAirVolume: this.dataModels.ccts[i].coolingTowers[j].maxAirVolume,
              minAirVolume: this.dataModels.ccts[i].coolingTowers[j].minAirVolume,
              inputPower: this.dataModels.ccts[i].coolingTowers[j].inputPower,
              ratedFreq: this.dataModels.ccts[i].coolingTowers[j].ratedFreq,
              statusOffDefaultValue: this.dataModels.ccts[i].coolingTowers[j].statusOffDefaultValue,
              cctId: this.dataModels.ccts[i].coolingTowers[j].cctId,
              bkCts: this.dataModels.bkCts,
              backupCtId: this.dataModels.ccts[i].coolingTowers[j].backupCtId,
              integratedCTList: this.dataModels.ccts[i].coolingTowers[j].integratedCTList
            },
            position: {
              x: positionCT.x,
              y: positionCT.y
            },
            classes: 'show-remove'
          });
        }
      }
    }
    // prepare data unitParent
    if (!_.isEmpty(this.dataModels.chillers)) {
      this.dataNodes.push(
        {
          data: {
            id: 'unitParent',
            name: '',
            type: 'unitParent'
          },
          position: {
            x: this.dataModels.chillers[0].posX,
            y: this.dataModels.chillers[0].posY,
          }
        }
      );
      let positionUit = {
        x: this.dataModels.chillers[0].posX,
        y: this.dataModels.chillers[0].posY,
      }
      _.forEach(this.dataModels.chillers, (unit, index: number) => {
        if (index == 0) {
        } else {
          positionUit.y = this.dataModels.chillers[0].posY + (120 * index);
        }
        // prepare data cdwp
        this.dataNodes.push(
          {
            group: 'nodes',
            data: {
              id: 'cdwp-' + unit['condenserWaterPump'].id,
              simulatorIndex: unit['condenserWaterPump'].simulatorIndex,
              name: unit['condenserWaterPump'].cdwpName,
              parent: 'unitParent',
              type: 'cdwp',
              flowRate: unit['condenserWaterPump'].flowRate,
              maxFlowRateRatio: unit['condenserWaterPump'].maxFlowRateRatio,
              minFlowRateRatio: unit['condenserWaterPump'].minFlowRateRatio,
              headCubicFactor: unit['condenserWaterPump'].headCubicFactor,
              headProportionalFactor: unit['condenserWaterPump'].headProportionalFactor,
              statusOffDefaultValue: unit['condenserWaterPump'].statusOffDefaultValue,
              bkCdwps: this.dataModels.bkCdwps,
              backupCdwpId: unit['condenserWaterPump'].backupCdwpId,
            },
            position: {
              x: positionUit.x + 300,
              y: positionUit.y
            },
            classes: 'show-remove'
          }
        );
        // prepare data chiller
        this.dataNodes.push(
          {
            data: {
              id: 'chiller-' + unit['id'],
              simulatorIndex: unit['simulatorIndex'],
              name: unit['chillerName'],
              parent: 'unitParent',
              type: 'chiller',
              coolingCap: unit['coolingCap'],
              enteringChilledWaterTemp: unit['enteringChilledWaterTemp'],
              leavingChilledWaterTemp: unit['leavingChilledWaterTemp'],
              enteringCondenserWaterTemp: unit['enteringCondenserWaterTemp'],
              leavingCondenserWaterTemp: unit['leavingCondenserWaterTemp'],
              inputPower: unit['inputPower'],
              cctId: unit['cctId'],
              perfCurveId: unit['perfCurveId']
            },
            position: {
              x: positionUit.x + 500,
              y: positionUit.y
            },
            classes: 'show-remove'
          }
        );
        // prepare data chwp
        this.dataNodes.push(
          {
            data: {
              id: 'chwp-' + unit['chillerWaterPump'].id,
              simulatorIndex: unit['chillerWaterPump'].simulatorIndex,
              name: unit['chillerWaterPump'].chwpName,
              parent: 'unitParent',
              type: 'chwp',
              flowRate: unit['chillerWaterPump'].flowRate,
              maxFlowRateRatio: unit['chillerWaterPump'].maxFlowRateRatio,
              minFlowRateRatio: unit['chillerWaterPump'].minFlowRateRatio,
              headCubicFactor: unit['chillerWaterPump'].headCubicFactor,
              headProportionalFactor: unit['chillerWaterPump'].headProportionalFactor,
              defaultValue: unit['chillerWaterPump'].defaultValue,
              bkChwps: this.dataModels.bkChwps,
              backupChwpId: unit['chillerWaterPump'].backupChwpId,
            },
            position: {
              x: positionUit.x + 700,
              y: positionUit.y
            },
            classes: 'show-remove'
          }
        );
        // prepare data free node
        this.dataNodes.push(
          {
            data: {
              id: 'none' + (index + 1),
              name: '',
              parent: 'unitParent',
              type: 'free',
            },
            position: {
              x: positionUit.x + 900,
              y: positionUit.y
            }
          }
        );
        // prepare data for edge
        this.dataEdges.push(
          {
            data: {
              id: 'hotEdge' + (index + 1),
              source: 'cdwp-' + unit['condenserWaterPump'].id,
              target: 'chiller-' + unit['id'],
              type: 'hot-edge'
            }
          }
        );
        this.dataEdges.push(
          {
            data: {
              id: 'coldEdge' + (index + 1),
              source: 'chiller-' + unit['id'],
              target: 'chwp-' + unit['chillerWaterPump'].id,
              type: 'cold-edge'
            }
          }
        );
        this.dataEdges.push(
          {
            data: {
              id: 'freeEdge' + (index + 1),
              source: 'chwp-' + unit['chillerWaterPump'].id,
              target: 'none' + (index + 1),
              type: 'free-edge'
            }
          }
        );
        // prepare verticalEdge edge
        if (this.dataModels.chillers.length > 1) {
          this.dataEdges.push(
            {
              data: {
                id: 'verticalEdge' + index,
                source: 'none1',
                target: 'none' + (this.dataModels.chillers.length),
                type: 'free-edge'
              }
            }
          );
        }
        // prepare red-edge
        if (unit['cctId']) {
          this.dataEdges.push(
            {
              data: {
                id: 'connect-edge' + index,
                source: 'cct-' + unit['cctId'],
                target: 'cdwp-' + unit['condenserWaterPump'].id,
                type: 'red-edge'
              }
            }
          );
        }
      });
      this.drawOutLine();
    }
    this.prepareBackup();
    prepareData = _.concat(this.dataNodes, this.dataEdges);
    return prepareData;
  }
  // prepare data for list backup
  prepareBackup() {
    let positionChiller = {
      x: 0,
      y: 0
    };
    const lengthUnit = this.dataModels.chillers.length;
    if (lengthUnit > 0) {
      positionChiller = {
        x: this.dataModels.chillers[0].posX,
        y: this.dataModels.chillers[0].posY
      }
    }
    this.dataNodes.push({
      data: {
        id: 'backupParentCT',
        name: 'Backup for CT',
        type: 'backup'
      },
      locked: true,
      position: {
        x: positionChiller.x + (-150),
        y: positionChiller.y + 200 + (130 * lengthUnit),
      },
    });

    let positionbackUpCT = {
      x: positionChiller.x + (-150),
      y: positionChiller.y + 200 + (130 * lengthUnit)
    };

    for (let j = 0; j < this.dataModels.bkCts.length; j++) {
      // config position of cooling tower
      if (j == 0) {
        // y -= 150;
      } else {
        if (j % 2 == 0) {
          positionbackUpCT.x -= 130;
          positionbackUpCT.y += 130;
        } else {
          positionbackUpCT.x += 130;
        }
      }
      this.dataNodes.push({
        group: 'nodes',
        data: {
          id: 'ct-' + this.dataModels.bkCts[j].id,
          simulatorIndex: this.dataModels.bkCts[j].simulatorIndex,
          name: this.dataModels.bkCts[j].ctName,
          parent: 'backupParentCT',
          type: 'ct',
          waterFlowRate: this.dataModels.bkCts[j].waterFlowRate,
          outdoorWetBulbTemp: this.dataModels.bkCts[j].outdoorWetBulbTemp,
          airVolume: this.dataModels.bkCts[j].airVolume,
          maxAirVolume: this.dataModels.bkCts[j].maxAirVolume,
          minAirVolume: this.dataModels.bkCts[j].minAirVolume,
          ratedFreq: this.dataModels.bkCts[j].ratedFreq,
          statusOffDefaultValue: this.dataModels.bkCts[j].statusOffDefaultValue,
          inputPower: this.dataModels.bkCts[j].inputPower,
          relatedCTs: this.dataModels.bkCts[j].relatedCTs,
          integratedCTList: this.dataModels.bkCts[j].integratedCTList
        },
        position: {
          x: positionbackUpCT.x,
          y: positionbackUpCT.y
        },
        classes: 'show-remove'
      });
    }

    // prepare node backup CDWP
    this.dataNodes.push({
      data: {
        id: 'backupParentCDWP',
        name: 'Backup for CDWP',
        type: 'backup'
      },
      locked: true,
      position: {
        x: positionChiller.x + (300),
        y: positionChiller.y + 200 + (130 * lengthUnit),
      },
    });
    let positionbackUpCDWP = {
      x: positionChiller.x + (300),
      y: positionChiller.y + 200 + (130 * lengthUnit)
    };

    for (let j = 0; j < this.dataModels.bkCdwps.length; j++) {
      // config position of cooling tower
      if (j == 0) {
        // y -= 150;
      } else {
        if (j % 2 == 0) {
          positionbackUpCDWP.x -= 130;
          positionbackUpCDWP.y += 130;
        } else {
          positionbackUpCDWP.x += 130;
        }
      }
      this.dataNodes.push({
        group: 'nodes',
        data: {
          id: 'cdwp-' + this.dataModels.bkCdwps[j].id,
          simulatorIndex: this.dataModels.bkCdwps[j].simulatorIndex,
          name: this.dataModels.bkCdwps[j].cdwpName,
          parent: 'backupParentCDWP',
          type: 'cdwp',
          flowRate: this.dataModels.bkCdwps[j].flowRate,
          maxFlowRateRatio: this.dataModels.bkCdwps[j].maxFlowRateRatio,
          minFlowRateRatio: this.dataModels.bkCdwps[j].minFlowRateRatio,
          headCubicFactor: this.dataModels.bkCdwps[j].headCubicFactor,
          headProportionalFactor: this.dataModels.bkCdwps[j].headProportionalFactor,
          statusOffDefaultValue: this.dataModels.bkCdwps[j].statusOffDefaultValue,
          relatedCDWPs: this.dataModels.bkCdwps[j].relatedCDWPs
        },
        position: {
          x: positionbackUpCDWP.x,
          y: positionbackUpCDWP.y
        },
        classes: 'show-remove'
      });
    }

    // prepare node backup CHWP
    this.dataNodes.push({
      group: 'nodes',
      data: {
        id: 'backupParentCHWP',
        name: 'Backup for CHWP',
        type: 'backup'
      },
      locked: true,
      position: {
        x: positionChiller.x + (710),
        y: positionChiller.y + 200 + (130 * lengthUnit),
      },
    });
    let positionbackUpCHWP = {
      x: positionChiller.x + (710),
      y: positionChiller.y + 200 + (130 * lengthUnit)
    };

    for (let j = 0; j < this.dataModels.bkChwps.length; j++) {
      // config position of cooling tower
      if (j == 0) {
        // y -= 150;
      } else {
        if (j % 2 == 0) {
          positionbackUpCHWP.x -= 130;
          positionbackUpCHWP.y += 130;
        } else {
          positionbackUpCHWP.x += 130;
        }
      }
      this.dataNodes.push({
        group: 'nodes',
        data: {
          id: 'chwp-' + this.dataModels.bkChwps[j].id,
          simulatorIndex: this.dataModels.bkChwps[j].simulatorIndex,
          name: this.dataModels.bkChwps[j].chwpName,
          parent: 'backupParentCHWP',
          type: 'chwp',
          flowRate: this.dataModels.bkChwps[j].flowRate,
          maxFlowRateRatio: this.dataModels.bkChwps[j].maxFlowRateRatio,
          minFlowRateRatio: this.dataModels.bkChwps[j].minFlowRateRatio,
          headCubicFactor: this.dataModels.bkChwps[j].headCubicFactor,
          headProportionalFactor: this.dataModels.bkChwps[j].headProportionalFactor,
          relatedCHWPs: this.dataModels.bkChwps[j].relatedCHWPs
        },
        position: {
          x: positionbackUpCHWP.x,
          y: positionbackUpCHWP.y
        },
        classes: 'show-remove'
      });
    }
  }
  // init prepare style for cytocape
  parepareStyle() {
    const prepareStyle = [
      // node
      {
        selector: 'node',
        style: {
          'shape': 'ellipse',
          'background-color': 'white',
          'width': 50,
          'height': 50,
          // 'content': 'data(id)',
          'content': (e) => {
            let backUpName = '';
            if (e.data('backupCtId')) {
              this.dataModels.bkCts.forEach((item) => {
                if (item.id == e.data('backupCtId')) {
                  backUpName = item.ctName;
                }
              });
              return (this.shortenContent(e.data('name'), 5) + ' / ' + this.shortenContent(backUpName, 5));
            } else if (e.data('backupCdwpId')) {
              this.dataModels.bkCdwps.forEach((item) => {
                if (item.id == e.data('backupCdwpId')) {
                  backUpName = item.cdwpName;
                }
              });
              return (this.shortenContent(e.data('name'), 15) + ' / ' + this.shortenContent(backUpName, 15));
            } else if (e.data('backupChwpId')) {
              this.dataModels.bkChwps.forEach((item) => {
                if (item.id == e.data('backupChwpId')) {
                  backUpName = item.chwpName;
                }
              });
              return (this.shortenContent(e.data('name'), 15) + ' / ' + this.shortenContent(backUpName, 15));
            } else {
              return (this.shortenContent(e.data('name'), 15));
            }
          },
          'border-color': 'white',
          'border-width': 1,
          'padding': 10
        }
      },
      // edge
      {
        selector: 'edge',
        style: {
          'width': 10,
          'line-color': '#cc0000',
        }
      },

      {
        selector: '.node_other',
        style: {
          'width': 30,
          'height': 30,
          'background-width': 30,
          'background-height': 30,
        }
      },

      {
        selector: 'node[type = "ct"]',
        style: {
          'background-image': 'url("assets/img/cct.png")',
          'background-width': 50,
          'background-height': 50,
          'width': 30,
          'height': 30,
        }
      },
      {
        selector: 'node[type = "cdwp"]',
        style: {
          'background-image': 'url("assets/img/cdwp.png")',
          'background-width': 30,
          'background-height': 30,
          'width': 30,
          'height': 30,
        }
      },
      {
        selector: 'node[type = "chwp"]',
        style: {
          'background-image': 'url("assets/img/chwp.png")',
          'background-width': 30,
          'background-height': 30,
          'width': 30,
          'height': 30,
        }
      },
      {
        selector: 'node[type = "chiller"]',
        style: {
          'background-image': 'url("assets/img/chiller.png")',
          'background-width': 50,
          'background-height': 30,
          'width': 50,
          'height': 30,
        }
      },

      {
        selector: '.node_hover',
        style: {
          'background-color': 'white',
          'border-width': 4,
          'border-color': 'blue',
        }
      },
      // node parent + cct
      {
        selector: 'node[type = "cct"], node[type = "backup"]',
        style: {
          'background-color': 'white',
          'border-color': 'red',
          'shape': 'rectangle'
        }
      },
      {
        selector: '.cct-hover',
        style: {
          'border-color': 'aqua',
        }
      },
      // node-free
      {
        selector: 'node[type="free"]',
        style: {
          'width': 1,
          'height': 1,
          'visibility': 'hidden'
        }
      },

      {
        // hot-edge',
        selector: 'edge[type="hot-edge"]',
        style: {
          'line-color': '#ff8000',
        }
      },
      {
        // selector: 'blue-edge',
        selector: 'edge[type="cold-edge"], edge[type="free-edge"]',
        style: {
          'line-color': '#0055cc',
        }
      },
      {
        selector: '.edge-red, edge[type="red-edge"]',
        style: {
          'line-color': '#cc0000',
        }
      },
      {
        selector: '.node-cdwp-hover',
        style: {
          'border-color': '#cc0000',
          'background-color': '#cc0000',
        }
      },
      {
        selector: 'node[id="unitParent"]',
        style: {
          'width': 400,
          'height': 100,
        }
      }
    ]
    return prepareStyle;
  }
  // init handle connect cct with cdwp
  iniEdgehandles() {
    this.cy.edgehandles({
      toggleOffOnLeave: true,
      handleColor: '#ff0000',
      handleNodes: 'node[type="cct"]',
      handlePosition: 'right middle',
      handleSize: 10,
      edgeType: (sourceNode, targetNode) => {
        if (sourceNode && targetNode) {
          if ((sourceNode.data().type === 'cct') && (targetNode.data().type === 'cdwp')) {
            if (targetNode.connectedEdges().length == 1) {
              return 'flat';
            }
          }
        }
        return null;
      },
      edgeParams: (sourceNode, targetNode, i) => {
        return {};
      },
      // add class after complete
      complete: (sourceNode, targetNodes, addedEntities) => {
        this.connectRedLine(sourceNode, targetNodes);
        addedEntities.data().type = 'red-edge';
        addedEntities.addClass('edge-red show-remove');
        targetNodes.removeClass('node-cdwp-hover');
      },
      hoverover: function (targetNode) {
        targetNode.addClass('node-cdwp-hover');
      },
      hoverout: function (targetNode) {
        targetNode.removeClass('node-cdwp-hover');
      },
    });
    if (this.isDrawModeOn) {
      this.cy.edgehandles('drawon');
    } else {
      this.cy.edgehandles('drawoff');
    }
  }
  // connect cct with cdwp by red line
  connectRedLine(sourceNode, targetNodes) {
    if (sourceNode && targetNodes) {
      const idSourceNode = Number(sourceNode.data().id.split('-')[1]),
        idTargetNode = Number(targetNodes.data().id.split('-')[1]);
      this.dataModels.chillers.filter((item) => {
        return item.condenserWaterPump.id == idTargetNode
      })[0].cctId = idSourceNode;
    }
  }
  // init handle click on node
  onClickOnNode() {
    this.cy.nodes().on('click', (e) => {
      const data = e.target.data();
      if (data.id !== 'unitParent') {
        this.showUpdateDialog(data);
      }
      e.stopPropagation();
    });
  }
  // init drag event
  fitModel() {
    this.cy.nodes().on('drag', (e) => {
      // clearTimeout(this.dragEvent);
      clearInterval(this.dragEvent);
      this.dragEvent = setInterval(() => {
        // this.cy.fit(20);
        this.cy.center(20);
        clearInterval(this.dragEvent);
      }, 500);
    });
  }
  // init update positon when an element's data changes position.
  updatePosition() {
    this.cy.nodes().on('position', (e) => {
      const target = e.target, typeTarget = _.split(target.data().id, '-', 2)[0];
      let index = -1, idTarget;
      if (typeTarget == 'cct') {
        idTarget = Number(_.split(target.data().id, '-', 2)[1]);
        index = _.findIndex(this.dataModels.ccts, function (o) {
          return o['id'] == idTarget;
        });
        // action update position
        const newPosition = {
          x: target.position().x - (this.dataModels.ccts[index].coolingTowers.length > 1 ? 65 : 0),
          y: target.position().y - (65 * this.matchPosition(this.dataModels.ccts[index].coolingTowers.length))
        }
        this.dataModels.ccts[index].posX = newPosition.x;
        this.dataModels.ccts[index].posY = newPosition.y;
      } else if (target.data().id == 'unitParent') {
        const newPosition = {
          x: target.position().x - 650,
          y: target.position().y - (55 * this.dataModels.chillers.length)
        }
        this.dataModels.chillers[0].posX = newPosition.x;
        this.dataModels.chillers[0].posY = newPosition.y;
      }
    });
  }
  matchPosition(lengthCT) {
    let multiplyNumber = 0;
    if (lengthCT % 2 != 0) {
      multiplyNumber = (lengthCT + 1) / 2;
    } else {
      multiplyNumber = lengthCT / 2;
    }
    return (multiplyNumber - 1);
  }
  // init update simulator index for equipment
  onDataChange() {
    // add systemIndex for equipment
    let lengthCt = 0, index_Old = 0;
    if (this.dataModels) {
      // cct & ct
      _.forEach(this.dataModels.ccts, (cct, j) => {
        cct['simulatorIndex'] = (j + 1);
        _.forEach(cct['coolingTowers'], (ct, i) => {
          ct['simulatorIndex'] = (i + 1 + lengthCt);
        });
        lengthCt = lengthCt + cct['coolingTowers'].length;
      });
      // cct backup
      _.forEach(this.dataModels.bkCts, (ct, j) => {
        ct['simulatorIndex'] = (j + 1 + lengthCt);
      });
      // chiller unit
      _.forEach(this.dataModels.chillers, (item, index) => {
        item['simulatorIndex'] = index + 1;
        item['chillerWaterPump'].simulatorIndex = (1 + index_Old);
        item['condenserWaterPump'].simulatorIndex = (item['chillerWaterPump'].simulatorIndex + 1);
        index_Old = item['condenserWaterPump'].simulatorIndex;
      });
      // chwp backup
      _.forEach(this.dataModels.bkChwps, (item, index) => {
        item['simulatorIndex'] = (1 + index_Old);
        index_Old = item['simulatorIndex'];
      });
      // cdwp backup
      _.forEach(this.dataModels.bkCdwps, (item, index) => {
        item['simulatorIndex'] = (1 + index_Old);
        index_Old = item['simulatorIndex'];
      });
    }
  }
  // init hove node
  hoverNode() {
    this.cy.nodes().on('mouseover', (e) => {
      this.cy.$('#' + e.target.id()).addClass('cct-hover');
    });
    this.cy.nodes().on('mouseout', (e) => {
      this.cy.$('#' + e.target.id()).removeClass('cct-hover');
    });
  }
  // init block move node (ct, chiller, cdwp...)
  blockMoveNode() {
    this.cy.nodes().nonorphans()
      .on('grab', function () {
        this.ungrabify();
      })
      .on('free', function () {
        this.grabify();
      });
  }
  // init menu right click
  initRightClickMenu() {
    const options = {
      menuItems: [
        {
          id: 'add-backup-ct',
          content: 'Add Backup CT',
          openMenuEvents: 'tap',
          image: {
            src: 'assets/img/add.svg',
            width: 12,
            height: 12,
            x: 5,
            y: 6.5
          },
          selector: 'node[id="backupParentCT"]',
          onClickFunction: (event) => {
            this.createCoolingTowerBackUp();
          }
        },
        {
          id: 'add-backup-cdwp',
          content: 'Add Backup CDWP',
          openMenuEvents: 'tap',
          image: {
            src: 'assets/img/add.svg',
            width: 12,
            height: 12,
            x: 5,
            y: 6.5
          },
          selector: 'node[id="backupParentCDWP"]',
          onClickFunction: (event) => {
            this.createCDWPBackUP();
          }
        },
        {
          id: 'add-backup-chwp',
          content: 'Add Backup CHWP',
          openMenuEvents: 'tap',
          image: {
            src: 'assets/img/add.svg',
            width: 12,
            height: 12,
            x: 5,
            y: 6.5
          },
          selector: 'node[id="backupParentCHWP"]',
          onClickFunction: (event) => {
            this.createCHWPBackUP();
          }
        },
        {
          id: 'remove',
          content: 'Remove',
          tooltipText: 'remove',
          openMenuEvents: 'tap',
          image: {
            src: 'assets/img/remove.svg',
            width: 12,
            height: 12,
            x: 5,
            y: 6.5
          },
          selector: 'node.show-remove, edge[type = "red-edge"]',
          onClickFunction: (event) => {
            let index = -1, foundIndex = null;
            const target = event.target || event.cyTarget,
              idTarget = Number(_.split(target.data().id, '-', 2)[1]);
            if (target.data().parent == 'backupParentCT') {
              this.removeCoolingBackUp(idTarget);
            } else if (target.data().parent == 'backupParentCDWP') {
              this.removeCDWPBackUp(idTarget);
            } else if (target.data().parent == 'backupParentCHWP') {
              this.removeCHWPBackUp(idTarget);
            } else if (target.data().type === 'cct') {
              this.removeCCT(idTarget);
            } else if (target.data().type === 'ct') {
              this.removeCooling(idTarget);
            } else if (target.data().parent === 'unitParent') {
              this.removeChillerUnit(target.data().type, idTarget);
            } else if (target.data().type === 'red-edge') {
              this.removeRedLine(target.data().target);
              target.remove();
            }
          },
          hasTrailingDivider: true
        },
        {
          id: 'add-node',
          content: 'Add CCT',
          tooltipText: 'Add combined cooling tower',
          openMenuEvents: 'cxttap',
          image: {
            src: 'assets/img/add.svg',
            width: 12,
            height: 12,
            x: 5,
            y: 6.5
          },
          coreAsWell: true,
          onClickFunction: (event) => {
            this.createCCT(event);
          }
        },
        {
          id: 'add-node',
          content: 'Add Chiller Unit',
          tooltipText: 'Add chiller unit',
          openMenuEvents: 'cxttap',
          image: {
            src: 'assets/img/add.svg',
            width: 12,
            height: 12,
            x: 5,
            y: 6.5
          },
          coreAsWell: true,
          onClickFunction: (event) => {
            this.createChillerUnit(event);
          }
        },
        {
          id: 'remove-all',
          content: 'Remove All',
          tooltipText: 'Remove All',
          image: { src: 'assets/img/remove.svg', width: 12, height: 12, x: 6, y: 4 },
          selector: 'node[id="unitParent"]',
          // coreAsWell: true,
          hasTrailingDivider: true,
          openMenuEvents: 'cxttap',
          onClickFunction: (event) => {
            const target = event.target || event.cyTarget,
              numOfRemove = this.dataModels.chillers.length;
            if (target.data().type == 'unitParent' && numOfRemove > 0) {
              this.dataModels.chillers.splice(0, numOfRemove);
              this.reloadPlantModel();
            }
          }
        },
      ],
      // css classes that menu items will have
      menuItemClasses: [
        // add class names to this list
      ],
      // css classes that context menu will have
      contextMenuClasses: ['setPosContextMenu']
    };
    this.cy.contextMenus(options);
  }
  // create CHWP back UP
  createCHWPBackUP() {
    const numBkCHWP = this.dataModels.bkChwps.length;
    if (numBkCHWP < 10) {
      this.dataModels.bkChwps.push(
        {
          id: ++this.curCHWP,
          simulatorIndex: null,
          chwpName: 'CHWP ' + this.curCHWP,
          flowRate: 0,
          maxFlowRateRatio: this.dataDefault.maxFlowRateRatio,
          minFlowRateRatio: this.dataDefault.minFlowRateRatio,
          headCubicFactor: 0,
          headProportionalFactor: this.dataDefault.headProportionalFactor,
          chillerPlantId: this.chillerPlantId
        }
      )
      this.reloadPlantModel();
    } else {
      this.showWarning('The maximum number of Backup for CHWP is 10');
    }
  }
  // create CDWP back UP
  createCDWPBackUP() {
    const numBkCDWP = this.dataModels.bkCdwps.length;
    if (numBkCDWP < 10) {
      this.dataModels.bkCdwps.push(
        {
          id: ++this.curCDWP,
          simulatorIndex: null,
          cdwpName: 'CDWP ' + this.curCDWP,
          flowRate: 0,
          maxFlowRateRatio: this.dataDefault.maxFlowRateRatio,
          minFlowRateRatio: this.dataDefault.minFlowRateRatio,
          headCubicFactor: 0,
          headProportionalFactor: this.dataDefault.headProportionalFactor,
          statusOffDefaultValue: null,
          chillerPlantId: this.chillerPlantId
        }
      )
      this.reloadPlantModel();
    } else {
      this.showWarning('The maximum number of Backup for CDWP is 10');
    }
  }
  // create CT back up
  createCoolingTowerBackUp() {
    const numBkCT = this.dataModels.bkCts.length;
    if (numBkCT < 10) {
      this.dataModels.bkCts.push(
        {
          id: ++this.curCT,
          simulatorIndex: null,
          ctName: 'CT ' + this.curCT,
          waterFlowRate: this.dataDefault.waterFlowRate,
          outdoorWetBulbTemp: this.dataDefault.outdoorWetBulbTemp,
          airVolume: this.dataDefault.airVolume,
          maxAirVolume: this.dataDefault.maxAirVolume,
          minAirVolume: this.dataDefault.minAirVolume,
          ratedFreq: this.dataDefault.ratedFreq,
          inputPower: null,
          statusOffDefaultValue: null,
          chillerPlantId: this.chillerPlantId
        }
      )
      this.reloadPlantModel();
    } else {
      this.showWarning('The maximum number of Backup for CT is 10');
    }
  }
  // remove chwp backup
  removeCHWPBackUp(idTarget) {
    let foundIndex = -1;
    this.dataModels.bkChwps.forEach((item, index) => {
      if (item.id == idTarget) {
        foundIndex = index;
        return true;
      }
    });
    this.dataModels.bkChwps.splice(foundIndex, 1);
    this.dataModels.chillers.forEach((item) => {
      if (item.chillerWaterPump.backupChwpId == idTarget) {
        item.chillerWaterPump.backupChwpId = null;
      }
    })
    this.reloadPlantModel();
  }
  // remove cdwp backup
  removeCDWPBackUp(idTarget) {
    let foundIndex = -1;
    this.dataModels.bkCdwps.forEach((item, index) => {
      if (item.id == idTarget) {
        foundIndex = index;
        return true;
      }
    });
    this.dataModels.bkCdwps.splice(foundIndex, 1);
    this.dataModels.chillers.forEach((item) => {
      if (item.condenserWaterPump.backupCdwpId == idTarget) {
        item.condenserWaterPump.backupCdwpId = null;
      }
    })
    this.reloadPlantModel();
  }
  // remove cooling backup
  removeCoolingBackUp(idTarget) {
    let foundIndex = -1;
    this.dataModels.bkCts.forEach((item, index) => {
      if (item.id == idTarget) {
        foundIndex = index;
        return true;
      }
    });
    this.dataModels.bkCts.splice(foundIndex, 1);
    this.dataModels.ccts.forEach((cct) => {
      cct.coolingTowers.forEach((ct) => {
        if (ct.backupCtId == idTarget) {
          ct.backupCtId = null;
        }
      })
    })
    this.reloadPlantModel();
  }
  // add new cct on screen
  createCCT(event) {
    const numOfCCT = this.dataModels.ccts.length;
    if (numOfCCT < 10) {
      this.dataModels.ccts.push(
        {
          id: ++this.curCCT,
          simulatorIndex: null,
          cctName: 'CCT ' + this.curCCT,
          coolingTowers: [
            {
              id: ++this.curCT,
              simulatorIndex: null,
              ctName: 'CT ' + this.curCT,
              backupCtId: null,
              waterFlowRate: this.dataDefault.waterFlowRate,
              outdoorWetBulbTemp: this.dataDefault.outdoorWetBulbTemp,
              airVolume: this.dataDefault.airVolume,
              maxAirVolume: this.dataDefault.maxAirVolume,
              minAirVolume: this.dataDefault.minAirVolume,
              ratedFreq: this.dataDefault.ratedFreq,
              inputPower: null,
              statusOffDefaultValue: null,
              cctId: this.curCCT,
              integratedCTList: null
            }
          ],
          posX: event.position.x,
          posY: event.position.y
        }
      )
      this.reloadPlantModel();
    } else {
      this.showWarning(LocalMessages.messages["105"]);
    }
  }
  // create new chiller unit
  createChillerUnit(event) {
    const numOfChiller = this.dataModels.chillers.length;
    if (numOfChiller < 10) {
      this.dataModels.chillers.push(
        {
          id: ++this.curChiller,
          chillerName: 'Chiller ' + this.curChiller,
          simulatorIndex: null,
          coolingCap: 0,
          enteringChilledWaterTemp: this.dataDefault.enteringChilledWaterTemp,
          leavingChilledWaterTemp: this.dataDefault.leavingChilledWaterTemp,
          enteringCondenserWaterTemp: this.dataDefault.enteringCondenserWaterTemp,
          leavingCondenserWaterTemp: this.dataDefault.leavingCondenserWaterTemp,
          inputPower: this.dataDefault.inputPower,
          cctId: null,
          perfCurveId: null,
          posX: 0,
          posY: 0,
          condenserWaterPump: {
            id: ++this.curCDWP,
            simulatorIndex: null,
            cdwpName: 'CDWP ' + this.curChiller,
            backupCdwpId: null,
            flowRate: 0,
            maxFlowRateRatio: this.dataDefault.maxFlowRateRatio,
            minFlowRateRatio: this.dataDefault.minFlowRateRatio,
            headCubicFactor: 0,
            headProportionalFactor: this.dataDefault.headProportionalFactor,
            statusOffDefaultValue: null
          },
          chillerWaterPump: {
            id: ++this.curCHWP,
            simulatorIndex: null,
            chwpName: 'CHWP ' + this.curChiller,
            backupChwpId: null,
            flowRate: 0,
            maxFlowRateRatio: this.dataDefault.maxFlowRateRatio,
            minFlowRateRatio: this.dataDefault.minFlowRateRatio,
            headCubicFactor: 0,
            headProportionalFactor: this.dataDefault.headProportionalFactor,
          }
        }
      );
      this.reloadPlantModel();
    } else {
      this.showWarning(LocalMessages.messages["30"]);
    }
  }
  // remove cct on right click
  removeCCT(idTarget) {
    // if (this.dataModels.ccts.length > 1) {
    let index = -1;
    index = _.findIndex(this.dataModels.ccts, function (o) {
      return o['id'] == idTarget;
    });
    // find index of idCCT remove on chillerUnit\
    this.dataModels.chillers.forEach((item) => {
      if (item.cctId == idTarget) {
        item.cctId = null;
      }
      // const indexUnit = _.findIndex(this.dataModels.chillers, function (o) {
      //   return o['cctId'] == idTarget;
      // });
      // // update idCCT = null
      // if (indexUnit >= 0) {
      //   this.dataModels.chillers[indexUnit].cctId = null;
      // }
    });
    if (index > -1) {
      this.dataModels.ccts.splice(index, 1);
      this.reloadPlantModel();
    }
    // }
  }
  // remove cooling tower on right click
  removeCooling(idTarget) {
    let index = -1;
    _.forEach(this.dataModels.ccts, (cct) => {
      // if (cct['coolingTowers'].length > 1) {
      index = _.findIndex(cct['coolingTowers'], function (o) {
        return o['id'] == idTarget;
      });
      if (index > -1) {
        cct['coolingTowers'].splice(index, 1);
        if (cct['coolingTowers'].length == 0) {
          this.removeCCT(cct['id']);
        }
      }
      this.reloadPlantModel();
      // }
    })
  }
  // remove chiller unit
  removeChillerUnit(type, idTarget) {
    // if (this.dataModels.chillers.length > 1) {
    let index = -1;
    if (type === 'cdwp') {
      index = _.findIndex(this.dataModels.chillers, function (o) {
        return o['condenserWaterPump'].id == idTarget;
      });
    } else if (type === 'chiller') {
      index = _.findIndex(this.dataModels.chillers, function (o) {
        return o['id'] == idTarget;
      });
    } else if (type === 'chwp') {
      index = _.findIndex(this.dataModels.chillers, function (o) {
        return o['chillerWaterPump'].id == idTarget;
      });
    }
    if (index > -1) {
      this.dataModels.chillers.splice(index, 1);
      this.reloadPlantModel();
    }
    // }
  }
  // remove red edge
  removeRedLine(target) {
    const cdwpId = Number(_.split(target, '-', 2)[1]);
    if (cdwpId) {
      this.dataModels.chillers.filter(item => {
        return item.condenserWaterPump.id == cdwpId;
      })[0].cctId = null;
    }
    this.reloadPlantModel();
  }
  updateDataDefaults(coolingCapacitys, data) {
    let coolingCapacityCDWP = 0, coolingCapacityCHWP, inputPower = 0;
    this.dataDefault.waterFlowRate = _.round((coolingCapacitys * this.dataDefault.conversionFactorFromRtToKw * this.dataDefault.conversionFactorForCTCapacity * this.dataDefault.conversionFactorWaterFlowRate), 2);
    this.dataDefault.airVolume = _.round((coolingCapacitys * this.dataDefault.conversionFactorFromRtToKw * this.dataDefault.conversionFactorForCTCapacity * this.dataDefault.conversionFactorAirVolume), 2);

    if (data.type == 'cdwp') {
      const idPump = Number(_.split(data.id, '-', 2)[1]);
      this.dataModels.chillers.forEach((element) => {
        if (element.condenserWaterPump.id == idPump) {
          coolingCapacityCDWP = element.coolingCap;
          inputPower = element.inputPower;
        }
      });
      this.dataDefault.flowRateCDWP = _.round(((coolingCapacityCDWP * this.dataDefault.conversionFactorFromRtToKw + inputPower) / ((this.dataDefault.enteringChilledWaterTemp - this.dataDefault.leavingChilledWaterTemp) / (this.dataDefault.waterHeatCapacity * 3.6))), 2);
    } else if (data.type == 'chwp') {
      const idPump = Number(_.split(data.id, '-', 2)[1]);
      this.dataModels.chillers.forEach((element) => {
        if (element.chillerWaterPump.id == idPump) {
          coolingCapacityCHWP = element.coolingCap;
        }
      });
      this.dataDefault.flowRateCHWP = _.round(((coolingCapacityCHWP * this.dataDefault.conversionFactorFromRtToKw) / ((this.dataDefault.enteringChilledWaterTemp - this.dataDefault.leavingChilledWaterTemp) / (this.dataDefault.waterHeatCapacity * 3.6))), 2);
    }
  }
  updateRelatedCTs(item) {
    let relatedCTList = [];
    const itemId = Number(_.split(item.id, '-', 2)[1]);
    this.dataModels.ccts.forEach((cct) => {
      cct.coolingTowers.forEach((ct) => {
        if (itemId == ct.backupCtId) {
          relatedCTList.push(ct.ctName);
        }
      });
    });
    item.relatedCTs = _.toString(relatedCTList);
  }
  updateRelatedCDWPs(item) {
    let relatedCDWPList = [];
    const itemId = Number(_.split(item.id, '-', 2)[1]);
    this.dataModels.chillers.forEach((chiller) => {
      if (itemId == chiller.condenserWaterPump.backupCdwpId) {
        relatedCDWPList.push(chiller.condenserWaterPump.cdwpName);
      }
    });
    item.relatedCDWPs = _.toString(relatedCDWPList);
  }
  updateRelatedCHWPs(item) {
    let relatedCHWPList = [];
    const itemId = Number(_.split(item.id, '-', 2)[1]);
    this.dataModels.chillers.forEach((chiller) => {
      if (itemId == chiller.chillerWaterPump.backupChwpId) {
        relatedCHWPList.push(chiller.chillerWaterPump.chwpName);
      }
    });
    item.relatedCHWPs = _.toString(relatedCHWPList);
  }
  // show update dialog
  showUpdateDialog(data) {
    let configDialog: any = {
      width: '500px',
      disableClose: true,
      data: data
    };
    const coolingCap = this.computeCapacity(data);
    // update data Default
    this.updateDataDefaults(coolingCap, data);
    configDialog.data.dataDefault = this.dataDefault;
    const indexName = _.findIndex(this.listName, (o) => {
      return o == data.name;
    });
    configDialog.data.listName = this.listName;
    configDialog.data.listName.splice(indexName, 1);
    // configDialog.data.listName = this.listName;
    let dialogRef = null;
    if (data.type === 'ct') {
      if (data.parent == 'backupParentCT') {
        this.updateRelatedCTs(configDialog.data);
        dialogRef = this.dialog.open(BackupCCTDialog, configDialog);
        if (dialogRef != null) {
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              this._UtilitiesService.showLoading();
              result.id = Number(_.split(result.id, '-', 2)[1]);
              this.updateCoolingBackUp(result);
              this._UtilitiesService.hideLoading();
            }
          });
        }
      } else {
        dialogRef = this.dialog.open(UpdateCoolingDialog, configDialog);
        if (dialogRef != null) {
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              this._UtilitiesService.showLoading();
              result.id = Number(_.split(result.id, '-', 2)[1]);
              this.updateCooling(result);
              this._UtilitiesService.hideLoading();
            }
          });
        }
      }
    } else if (data.type === 'chiller') {
      dialogRef = this.dialog.open(UpdateChillerDialog, configDialog);
      if (dialogRef != null) {
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this._UtilitiesService.showLoading();
            result.id = Number(_.split(result.id, '-', 2)[1]);
            this.updateChiller(result);
            this._UtilitiesService.hideLoading();
          }
        });
      }
    } else if (data.type === 'cdwp') {
      if (data.parent == 'backupParentCDWP') {
        this.updateRelatedCDWPs(configDialog.data);
        dialogRef = this.dialog.open(BackupCDWPDialog, configDialog);
        if (dialogRef != null) {
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              this._UtilitiesService.showLoading();
              result.id = Number(_.split(result.id, '-', 2)[1]);
              this.updateCDWPBackUp(result);
              this._UtilitiesService.hideLoading();
            }
          });
        }
      } else {
        dialogRef = this.dialog.open(UpdateCDWPDialog, configDialog);
        if (dialogRef != null) {
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              this._UtilitiesService.showLoading();
              result.id = Number(_.split(result.id, '-', 2)[1]);
              this.updateCDWP(result);
              this._UtilitiesService.hideLoading();
            }
          });
        }
      }
    } else if (data.type === 'chwp') {
      if (data.parent == 'backupParentCHWP') {
        this.updateRelatedCHWPs(configDialog.data);
        dialogRef = this.dialog.open(BackupCHWPDialog, configDialog);
        if (dialogRef != null) {
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              this._UtilitiesService.showLoading();
              result.id = Number(_.split(result.id, '-', 2)[1]);
              this.updateCHWPBackUp(result);
              this._UtilitiesService.hideLoading();
            }
          });
        }
      } else {
        dialogRef = this.dialog.open(UpdateCHWPDialog, configDialog);
        if (dialogRef != null) {
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              this._UtilitiesService.showLoading();
              result.id = Number(_.split(result.id, '-', 2)[1]);
              this.updateCHWP(result);
              this._UtilitiesService.hideLoading();
            }
          });
        }
      }
    } else if (data.type === 'cct') {
      // numOfNewCCT = number of ct of cooling tower curent
      configDialog.data.numOfNewCCT = this.dataModels.ccts.filter(item => {
        return item.id == data.id.split('-')[1];
      })[0].coolingTowers.length;
      dialogRef = this.dialog.open(AddCctDialog, configDialog);
      if (dialogRef != null) {
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this._UtilitiesService.showLoading();
            result.id = Number(_.split(result.id, '-', 2)[1]);
            this.updateCCT(result);
            this._UtilitiesService.hideLoading();
          }
        });
      }
    }
  }
  // update data for chiller
  updateChiller(data) {
    let index = _.findIndex(this.dataModels.chillers, function (o) {
      return o['id'] == data.id;
    });
    if (index > -1) {
      this.dataModels.chillers[index].chillerName = data.name;
      this.dataModels.chillers[index].coolingCap = data.coolingCap;
      this.dataModels.chillers[index].enteringChilledWaterTemp = data.enteringChilledWaterTemp;
      this.dataModels.chillers[index].leavingChilledWaterTemp = data.leavingChilledWaterTemp;
      this.dataModels.chillers[index].enteringCondenserWaterTemp = data.enteringCondenserWaterTemp;
      this.dataModels.chillers[index].leavingCondenserWaterTemp = data.leavingCondenserWaterTemp;
      this.dataModels.chillers[index].inputPower = data.inputPower;
      this.dataModels.chillers[index].perfCurveId = data.perfCurveId;
      // this.showSuccess('Update chiller information successful');
    } else {
      // this.showError('Update chiller information fail');
    }
    this.reloadPlantModel();
  }
  // update data for cdwp
  updateCDWP(data) {
    let index = _.findIndex(this.dataModels.chillers, function (o) {
      return o['condenserWaterPump'].id == data.id;
    });
    if (index > -1) {
      this.dataModels.chillers[index].condenserWaterPump.cdwpName = data.name;
      this.dataModels.chillers[index].condenserWaterPump.flowRate = data.flowRate;
      this.dataModels.chillers[index].condenserWaterPump.maxFlowRateRatio = data.maxFlowRateRatio;
      this.dataModels.chillers[index].condenserWaterPump.minFlowRateRatio = data.minFlowRateRatio;
      this.dataModels.chillers[index].condenserWaterPump.headCubicFactor = data.headCubicFactor;
      this.dataModels.chillers[index].condenserWaterPump.headProportionalFactor = data.headProportionalFactor;
      this.dataModels.chillers[index].condenserWaterPump.statusOffDefaultValue = data.statusOffDefaultValue;
      this.dataModels.chillers[index].condenserWaterPump.backupCdwpId = data.backupCdwpId;
      // this.showSuccess('Update cdwp information successful');
    } else {
      // this.showError('Update cdwp information fail');
    }
    this.reloadPlantModel();
  }
  // update data for cdwp back up
  updateCDWPBackUp(data) {
    _.forEach(this.dataModels.bkCdwps, (item) => {
      if (item['id'] == data.id) {
        item['cdwpName'] = data.name;
        item['flowRate'] = data.flowRate;
        item['maxFlowRateRatio'] = data.maxFlowRateRatio;
        item['minFlowRateRatio'] = data.minFlowRateRatio;
        item['headCubicFactor'] = data.headCubicFactor;
        item['headProportionalFactor'] = data.headProportionalFactor;
        item['statusOffDefaultValue'] = data.statusOffDefaultValue;
      }
    });
    this.reloadPlantModel();
  }
  // update data for chdp
  updateCHWP(data) {
    let index = _.findIndex(this.dataModels.chillers, function (o) {
      return o['chillerWaterPump'].id == data.id;
    });
    if (index > -1) {
      this.dataModels.chillers[index].chillerWaterPump.chwpName = data.name;
      this.dataModels.chillers[index].chillerWaterPump.flowRate = data.flowRate;
      this.dataModels.chillers[index].chillerWaterPump.maxFlowRateRatio = data.maxFlowRateRatio;
      this.dataModels.chillers[index].chillerWaterPump.minFlowRateRatio = data.minFlowRateRatio;
      this.dataModels.chillers[index].chillerWaterPump.headCubicFactor = data.headCubicFactor;
      this.dataModels.chillers[index].chillerWaterPump.headProportionalFactor = data.headProportionalFactor;
      this.dataModels.chillers[index].chillerWaterPump.backupChwpId = data.backupChwpId;
      // this.showSuccess('Update chwp information successful');
    } else {
      // this.showError('Update chwp information fail');
    }
    this.reloadPlantModel();
  }
  // update data for chdp backup
  updateCHWPBackUp(data) {
    _.forEach(this.dataModels.bkChwps, (item) => {
      if (item['id'] == data.id) {
        item['chwpName'] = data.name;
        item['flowRate'] = data.flowRate;
        item['maxFlowRateRatio'] = data.maxFlowRateRatio;
        item['minFlowRateRatio'] = data.minFlowRateRatio;
        item['headCubicFactor'] = data.headCubicFactor;
        item['headProportionalFactor'] = data.headProportionalFactor;
      }
    });
    this.reloadPlantModel();
  }
  // update data for cooling
  updateCooling(data) {
    let index = -1, cct = null;
    cct = _.find(this.dataModels.ccts, function (o) {
      return o['id'] == data.cctId;
    });
    if (cct) {
      index = _.findIndex(cct.coolingTowers, function (o) {
        return o['id'] == data.id;
      });
      if (index > -1) {
        cct.coolingTowers[index].ctName = data.name;
        cct.coolingTowers[index].waterFlowRate = data.waterFlowRate;
        cct.coolingTowers[index].outdoorWetBulbTemp = data.outdoorWetBulbTemp;
        cct.coolingTowers[index].airVolume = data.airVolume;
        cct.coolingTowers[index].maxAirVolume = data.maxAirVolume;
        cct.coolingTowers[index].minAirVolume = data.minAirVolume;
        cct.coolingTowers[index].inputPower = data.inputPower;
        cct.coolingTowers[index].statusOffDefaultValue = data.statusOffDefaultValue;
        cct.coolingTowers[index].ratedFreq = data.ratedFreq;
        cct.coolingTowers[index].backupCtId = data.backupCtId;
        // cct.coolingTowers[index].integratedCTList = data.integratedCTList;
        // this.showSuccess('Update cooling tower information successful');
      } else {
        // this.showError('Update cooling tower information fail');
      }
    }
    this.reloadPlantModel();
  }
  // update data for cooling backup
  updateCoolingBackUp(data) {
    _.forEach(this.dataModels.bkCts, (item) => {
      if (item['id'] == data.id) {
        item['ctName'] = data.name;
        item['waterFlowRate'] = data.waterFlowRate;
        item['outdoorWetBulbTemp'] = data.outdoorWetBulbTemp;
        item['airVolume'] = data.airVolume;
        item['maxAirVolume'] = data.maxAirVolume;
        item['minAirVolume'] = data.minAirVolume;
        item['inputPower'] = data.inputPower;
        item['statusOffDefaultValue'] = data.statusOffDefaultValue;
        item['ratedFreq'] = data.ratedFreq;
      }
    });
    this.reloadPlantModel();
  }
  // update cct
  updateCCT(data) {
    let index = -1, cct = null;
    cct = _.find(this.dataModels.ccts, function (o) {
      return o['id'] == data.id;
    });
    if (cct) {
      cct.cctName = data.name;
      this.updateNumberCoolingOnCCT(cct, data.numOfNewCCT);
      // this.showSuccess('Update cct information successful');
    }
    this.reloadPlantModel();
  }
  updateNumberCoolingOnCCT(cct, numberUpdateCt) {
    const numberCtAddNew = numberUpdateCt - cct.coolingTowers.length;
    if (numberCtAddNew != 0) {
      this.createCoolingTower(cct.id, numberCtAddNew, numberUpdateCt);
    }
  }
  // create Cooling tower
  createCoolingTower(cctId, numberCtAddNew, numberUpdateCt) {
    const index = _.findIndex(this.dataModels.ccts, function (o) {
      return o['id'] == cctId;
    });
    if (numberCtAddNew > 0) {
      for (let i = 0; i < numberCtAddNew; i++) {
        let prepareData = {
          id: ++this.curCT,
          ctName: 'CT ' + this.curCT,
          backupCtId: null,
          waterFlowRate: this.dataDefault.waterFlowRate,
          outdoorWetBulbTemp: this.dataDefault.outdoorWetBulbTemp,
          airVolume: this.dataDefault.airVolume,
          maxAirVolume: this.dataDefault.maxAirVolume,
          minAirVolume: this.dataDefault.minAirVolume,
          ratedFreq: this.dataDefault.ratedFreq,
          inputPower: null,
          statusOffDefaultValue: null,
          cctId: cctId,
          integratedCTList: null
        }
        this.dataModels.ccts[index].coolingTowers.push(prepareData);
      }
    } else {
      this.dataModels.ccts[index].coolingTowers.splice(numberCtAddNew, -numberCtAddNew);
      if (this.dataModels.ccts[index].coolingTowers.length == 0) {
        this.removeCCT(this.dataModels.ccts[index].id);
      }
    }
  }
  // sum capacity of chiller unit
  computeCapacity(ct) {
    const idCooling = Number(_.split(ct.id, '-', 2)[1]);
    const idCCT = Number(_.split(ct.parent, '-', 2)[1]);
    if (_.isNaN(idCCT)) {
      return 0;
    } else {
      let coolingCapacity = 0, sumCoolingCap = 0, lengthCT = 0;
      this.dataModels.chillers.forEach((item) => {
        if (item.cctId == idCCT) {
          sumCoolingCap += item.coolingCap;
        }
      });
      this.dataModels.ccts.forEach((item) => {
        if (item.id == idCCT) {
          lengthCT = item.coolingTowers.length;
        }
      });
      coolingCapacity = sumCoolingCap / lengthCT;
      return coolingCapacity;
    }
  }
  drawOutLine() {
    const arrCDWP = this.dataNodes.filter(item => {
      // find free node
      return item.data.type == 'free';
    });
    let firstItem = arrCDWP[0];
    let lastItem = arrCDWP.splice(-1)[0];
    let pos = {
      x: firstItem.position.x,
      y: firstItem.position.y + (lastItem.position.y - firstItem.position.y) / 2,
    }
    let distanceOutLine = 150;

    if (this.outLine['node'] !== undefined) {
      this.outLine['node'][0].position.x = pos.x;
      this.outLine['node'][0].position.y = pos.y;
      this.outLine['node'][1].position.x = pos.x + distanceOutLine;
      this.outLine['node'][1].position.y = pos.y;
    } else {
      // initial outline
      this.outLine['node'] = [
        {
          data: {
            id: 'noneSource',
            name: '',
            parent: 'unitParent',
            type: 'free',
          },
          position: {
            x: pos.x,
            y: pos.y
          },
        },
        {
          data: {
            id: 'noneDes',
            name: '',
            parent: 'unitParent',
            type: 'free',
          },
          position: {
            x: pos.x + distanceOutLine,
            y: pos.y
          },
        }
      ];
      this.outLine['edge'] = {
        data: {
          id: 'coldEdgeOutline',
          source: 'noneSource',
          target: 'noneDes',
          type: 'cold-edge'
        }
      };
    }

    // add outline
    this.dataNodes.push(this.outLine['node'][0]);
    this.dataNodes.push(this.outLine['node'][1]);
    this.dataNodes.push(this.outLine['edge']);
  }
  // enable/disable drawmodel
  drawModel() {
    this.isDrawModeOn = !this.isDrawModeOn;
    if (this.isDrawModeOn) {
      this.cy.edgehandles('drawon');
      this.statusDrawModel = 'On'
    } else {
      this.cy.edgehandles('drawoff');
      this.statusDrawModel = 'Off'
    }
  }
  // save plant model
  showSaveConfirm(trigged) {
    const errorList = this.checkDuplicate();
    if (errorList.length > 0) {
      this._UtilitiesService.validationErrorDisplay(errorList);
    } else {
      this._UtilitiesService.showConfirmDialog(LocalMessages.messages['113'], (result) => {
        if (result) {
          this._UtilitiesService.showLoading();
          this.saveAction().then(() => {
            this._UtilitiesService.hideLoading();
          }).catch((err) => {
            this._UtilitiesService.hideLoading();
          });
        }
      });
    }
  }
  // execute save data
  saveAction() {
    const request = this.prepareUpdateData(this.dataModels);
    return this.chillerPlantService.putChillerPlantDetail(request).then(result => {
      if (result) {
        this.reloadData().then(() => {
          this.reloadPlantModel();
          this.showSuccess(LocalMessages.messages['13']);
        })
      }
    }, error => {
      if (error) {
        this._UtilitiesService.showErrorAPI(error, null);
        this.reloadData().then(() => {
          this.reloadPlantModel();
        });
      }
    });
  }
  // prepare Data
  prepareUpdateData(item) {
    let request = {
      id: item.id,
      chillers: item.chillers,
      ccts: item.ccts,
      bkCts: item.bkCts,
      bkCdwps: item.bkCdwps,
      bkChwps: item.bkChwps,
      modifiedDate: item.modifiedDate
    }
    return request;
  }
  // execute export data
  exportAction() {
    const request = {
      id: this.chillerPlantId
    };
    const filename = 'chiller_model.zip';
    this._UtilitiesService.showLoading();
    return this.chillerPlantService.exportChillerPlantModel(request).then(result => {
      if (result) {
        let blob = new Blob([result], {
          type: 'application/zip'
        });
        FileSaver.saveAs(blob, filename);
        this.reloadData().then(() => {
          this._UtilitiesService.stopLoading();
          this.showSuccess(LocalMessages.messages['32']);
        })
      }
    }, error => {
      this._UtilitiesService.stopLoading();
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }
  // button reload
  reload() {
    this._UtilitiesService.showLoading();
    this.reloadData().then(() => {
      this.reloadPlantModel();
      this._UtilitiesService.hideLoading();
    });
  }
  // show massage
  showError(message) {
    this._UtilitiesService.showError(message);
  }
  showSuccess(message) {
    this._UtilitiesService.showSuccess(message);
  }
  showWarning(message) {
    this._UtilitiesService.showWarning(message);
  }
  // show alert when componet destroy
  showAlertSave() {
    if (!_.isEqual(this.dataModels, this.dataModelOld)) {
      this.showSaveConfirm(false);
    }
  }

  isDataChanged() {
    if (_.isEqual(this.dataModels, this.dataModelOld)) {
      this.sharedService.setData(VARIABLES.DATA_CHANGED, false);
    } else {
      this.sharedService.setData(VARIABLES.DATA_CHANGED, true);
    }
  }

  // handle shorten
  shortenContent(content, lengthContent) {
    let shorten = '';
    if (content && (content.length > lengthContent)) {
      shorten = content.substr(0, lengthContent) + '...';
      return shorten;
    } else {
      return content;
    }
  }
  checkDuplicate() {
    let errorList = [];
    const duplicate = _.filter(this.listName, function (value, index: number, iteratee) {
      return _.includes(iteratee, value, index + 1);
    });
    if (duplicate.length > 0) {
      errorList.push(LocalMessages.messages['29']);
    }
    return errorList;
  }
}

// component dialog update
@Component({
  selector: 'update-chiller-dialog',
  templateUrl: 'update-chiller-dialog.html',
  styleUrls: ['./plant-model.component.scss']
})
export class UpdateChillerDialog implements OnInit {
  updateData: any = {};
  dataDefault: any;
  inputMaxName: number = VARIABLES.INPUT_MAX_NAME;
  perfCurves = [];
  constructor(
    public dialogRef: MatDialogRef<UpdateChillerDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _UtilitiesService: UtilitiesService,
    private _ValidateService: ValidateService,
    private _PerformanceCurveService: PerformanceCurveService,

  ) { }
  ngOnInit() {
    this.updateData = _.cloneDeep(this.data);
    this.dataDefault = this.data.dataDefault;
    this.getData();
  }
  // show list performavce Curve when click to combo box
  getData() {
    this._UtilitiesService.showLoading();
    this.getPerformanceCurve().then(() => {
      this._UtilitiesService.stopLoading();
    }).catch(() => {
      this._UtilitiesService.stopLoading();
    })
  }
  //  get list performance curve
  getPerformanceCurve() {
    const request = {};
    return this._PerformanceCurveService.getPerformanceCurveList(request).then(result => {
      if (result) {
        this.perfCurves = result.content;
      }
    }, error => {
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }

  // handle disable button 'save'
  compareData() {
    if (_.isEqual(this.data, this.updateData)) {
      return true;
    } else if (!this.updateData.name) {
      return true;
    } else if (this.updateData.coolingCap === '') {
      return true;
    } else if (this.updateData.inputPower === '') {
      return true;
    }
    return false;
  }
  updateInfo() {
    let errorInput = [];
    errorInput = this.inputValidation(this.updateData);
    if (errorInput.length > 0) {
      this._UtilitiesService.validationErrorDisplay(errorInput);
    } else {
      this.dialogRef.close(this.updateData);
    }
  }
  inputValidation(updateData) {
    let errorInput = [];
    updateData.name = _.trim(updateData.name);
    if (!updateData.name) {
      errorInput.push(LocalMessages.messages['15']);
    } else if (!this._ValidateService.checkValidInputName(updateData.name, true)) {
      errorInput.push(LocalMessages.messages['1']);
    } else if (_.indexOf(this.data.listName, updateData.name) > -1) {
      errorInput.push(LocalMessages.messages['29']);
    }
    if (updateData.coolingCap === '') {
      errorInput.push(LocalMessages.messages['15']);
    } else {
      updateData.coolingCap = this.checkInvalid(updateData.coolingCap, errorInput, "Cooling Capacity[RT] is invalid");
      if (updateData.coolingCap > 100000) {
        errorInput.push('Maximum value of Cooling Capacity[RT] is 100,000');
      }
    }
    if (updateData.inputPower === '') {
      errorInput.push(LocalMessages.messages['15']);
    } else {
      updateData.inputPower = this.checkInvalid(updateData.inputPower, errorInput, "Input Power[kW] is invalid");
      if (updateData.inputPower > 100000) {
        errorInput.push('Maximum value of Input Power[kW] is 100,000');
      }
    }
    // if (!updateData.perfCurveId) {
    //   errorInput.push("Select Performance Curve is missing");
    // };
    if (updateData.enteringChilledWaterTemp) {
      updateData.enteringChilledWaterTemp = this.checkInvalid(updateData.enteringChilledWaterTemp, errorInput, "Entering Chilled Water Temperature[C] is invalid");
      if (updateData.enteringChilledWaterTemp > 50) {
        errorInput.push('Maximum value of Chilled Water Temperature[C] is 50');
      }
    }
    if (updateData.enteringCondenserWaterTemp) {
      updateData.enteringCondenserWaterTemp = this.checkInvalid(updateData.enteringCondenserWaterTemp, errorInput, "Enter Condenser Water Temperature[C] is invalid");
      if (updateData.enteringCondenserWaterTemp > 50) {
        errorInput.push('Maximum value of Condenser Water Temperature[C] is 50');
      }
    };
    if (updateData.leavingChilledWaterTemp) {
      updateData.leavingChilledWaterTemp = this.checkInvalid(updateData.leavingChilledWaterTemp, errorInput, "Leaving Chilled Water Temperature[C] is invalid");
      if (updateData.leavingChilledWaterTemp > 50) {
        errorInput.push('Maximum value of Chilled Water Temperature[C] is 50');
      }
    };
    if (updateData.leavingCondenserWaterTemp) {
      updateData.leavingCondenserWaterTemp = this.checkInvalid(updateData.leavingCondenserWaterTemp, errorInput, "Leaving Condenser Water Temperature[C] is invalid");
      if (updateData.leavingCondenserWaterTemp > 50) {
        errorInput.push('Maximum value of Condenser Water Temperature[C] is 50');
      }
    };
    return errorInput;
  }
  setDefault() {
    this.updateData.enteringChilledWaterTemp = this.dataDefault.enteringChilledWaterTemp;
    this.updateData.leavingChilledWaterTemp = this.dataDefault.leavingChilledWaterTemp;
    this.updateData.enteringCondenserWaterTemp = this.dataDefault.enteringCondenserWaterTemp;
    this.updateData.leavingCondenserWaterTemp = this.dataDefault.leavingCondenserWaterTemp;
    this.updateData.inputPower = _.round((this.updateData.coolingCap * this.dataDefault.conversionFactorFromRtToKw * this.dataDefault.conversionFactorForChiller), 2);
  }
  floatInput(event) {
    return event.charCode >= 48 &&
      event.charCode <= 57 ||
      event.charCode == 46
  }
  checkInvalid(item, errorList, message) {
    if (_.isNaN(Number(item)) == true || Number(item) < 0) {
      errorList.push(message);
      return item;
    } else {
      return Number(item);
    }
  }
  checkRequire(updateData) {
    if (!updateData.name) {
      return true;
    } else if (updateData.coolingCap === '') {
      return true;
    } else if (updateData.inputPower === '') {
      return true;
    } else {
      return false;
    }
  }
}

@Component({
  selector: 'update-cooling-dialog',
  templateUrl: 'update-cooling-dialog.html',
  styleUrls: ['./plant-model.component.scss']
})
export class UpdateCoolingDialog implements OnInit {
  updateData: any = {};
  dataDefault: any;
  inputMaxName: number = VARIABLES.INPUT_MAX_NAME;
  constructor(
    public dialogRef: MatDialogRef<UpdateCoolingDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _UtilitiesService: UtilitiesService,
    private _ValidateService: ValidateService,
  ) { }
  ngOnInit() {
    this.updateData = _.cloneDeep(this.data);
    this.dataDefault = this.data.dataDefault;
  }

  //view
  compareData() {
    if (_.isEqual(this.data, this.updateData)) {
      return true;
    } else if (!this.updateData.name) {
      return true;
    } else if (this.updateData.waterFlowRate === '') {
      return true;
    } else if (this.updateData.airVolume === '') {
      return true;
    }
    return false;
  }

  updateInfo() {
    let errorInput = [];
    errorInput = this.inputValidation(this.updateData);
    if (errorInput.length > 0) {
      this._UtilitiesService.validationErrorDisplay(errorInput);
    } else {
      this.dialogRef.close(this.updateData);
    }
  }
  inputValidation(updateData) {
    let errorInput = [];
    updateData.name = _.trim(updateData.name);
    if (!updateData.name) {
      errorInput.push(LocalMessages.messages['15']);
    } else if (!this._ValidateService.checkValidInputName(updateData.name, true)) {
      errorInput.push(LocalMessages.messages['1']);
    } else if (_.indexOf(this.data.listName, updateData.name) > -1) {
      errorInput.push(LocalMessages.messages['29']);
    }
    if (updateData.inputPower === '') {
      errorInput.push(LocalMessages.messages['15']);
    } else {
      updateData.inputPower = this.checkInvalid(updateData.inputPower, errorInput, "Input Power[kW] is invalid");
      if (updateData.inputPower > 100000) {
        errorInput.push('Maximum value of Input Power[kW] is 100,000');
      }
    }
    if (updateData.waterFlowRate === '') {
      errorInput.push(LocalMessages.messages['15']);
    } else {
      updateData.waterFlowRate = this.checkInvalid(updateData.waterFlowRate, errorInput, "Water Flow Rate[m3/min] is invalid");
      if (updateData.waterFlowRate > 10000) {
        errorInput.push('Maximum value of Flow Rate[m3/min] is 10,000');
      }
    }
    if (updateData.outdoorWetBulbTemp) {
      updateData.outdoorWetBulbTemp = this.checkInvalid(updateData.outdoorWetBulbTemp, errorInput, "Outdoor Wet-bulb Temperature[C] is invalid");
      if (updateData.outdoorWetBulbTemp > 150) {
        errorInput.push('Maximum value of Outdoor Wet-bulb Temperature[C] is 150');
      }
    }
    if (updateData.airVolume === '') {
      errorInput.push(LocalMessages.messages['15']);
    } else {
      updateData.airVolume = this.checkInvalid(updateData.airVolume, errorInput, "Air Volume[m3/min] is invalid");
      if (updateData.airVolume > 1000000) {
        errorInput.push('Maximum value of Volume[m3/min] is 1,000,000');
      }
    }
    if (updateData.maxAirVolume) {
      updateData.maxAirVolume = this.checkInvalid(updateData.maxAirVolume, errorInput, "Maximum Air Volume Rate[%] is invalid");
      if (updateData.maxAirVolume > 200) {
        errorInput.push('Max value of Maximum Air Volume Rate[%] is 200');
      }
    }
    if (updateData.minAirVolume) {
      updateData.minAirVolume = this.checkInvalid(updateData.minAirVolume, errorInput, "Minimum Air Volume Rate[%] is invalid");
      if (updateData.minAirVolume > 200) {
        errorInput.push('Max value of Minimum Air Volume Rate[%] is 200');
      }
    }
    if (updateData.maxAirVolume < updateData.minAirVolume) {
      errorInput.push(LocalMessages.messages['109']);
    }
    if (updateData.ratedFreq) {
      updateData.ratedFreq = this.checkInvalid(updateData.ratedFreq, errorInput, "Rated Frequency[Hz] is invalid");
      if (updateData.ratedFreq > 100) {
        errorInput.push('Max value of Rated Frequency[Hz] is 100');
      }
    }
    if (updateData.statusOffDefaultValue) {
      updateData.statusOffDefaultValue = this.checkInvalid(updateData.statusOffDefaultValue, errorInput, "Default Value When Status Is Off[C] is invalid");
      if (updateData.statusOffDefaultValue > 100) {
        errorInput.push('Max value of Default Value When Status Is Off[C] is 100');
      }
    }
    return errorInput;
  }
  setDefault() {
    this.updateData.outdoorWetBulbTemp = this.dataDefault.outdoorWetBulbTemp;
    this.updateData.maxAirVolume = this.dataDefault.maxAirVolume;
    this.updateData.minAirVolume = this.dataDefault.minAirVolume;
    this.updateData.ratedFreq = this.dataDefault.ratedFreq;
    this.updateData.waterFlowRate = this.dataDefault.waterFlowRate;
    this.updateData.airVolume = this.dataDefault.airVolume;
  }
  floatInput(event) {
    return event.charCode >= 48 &&
      event.charCode <= 57 ||
      event.charCode == 46
  }
  checkInvalid(item, errorList, message) {
    if (_.isNaN(Number(item)) == true || Number(item) < 0) {
      errorList.push(message);
      return item;
    } else {
      return Number(item);
    }
  }
}

@Component({
  selector: 'update-cdwp-dialog',
  templateUrl: 'update-cdwp-dialog.html',
  styleUrls: ['./plant-model.component.scss']
})
export class UpdateCDWPDialog implements OnInit {
  updateData: any = {};
  dataDefault: any;
  inputMaxName: number = VARIABLES.INPUT_MAX_NAME;
  constructor(
    public dialogRef: MatDialogRef<UpdateCDWPDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _UtilitiesService: UtilitiesService,
    private _ValidateService: ValidateService,
  ) { }
  ngOnInit() {
    this.updateData = _.cloneDeep(this.data);
    this.dataDefault = this.data.dataDefault;
  }

  // handle disable button 'save'
  compareData() {
    if (_.isEqual(this.data, this.updateData)) {
      return true;
    } else if (!this.updateData.name) {
      return true;
    } else if (this.updateData.headCubicFactor === '') {
      return true;
    } else if (this.updateData.flowRate === '') {
      return true;
    }
    return false;
  }

  updateInfo() {
    let errorInput = [];
    errorInput = this.inputValidation(this.updateData);
    if (errorInput.length > 0) {
      this._UtilitiesService.validationErrorDisplay(errorInput);
    } else {
      this.dialogRef.close(this.updateData);
    }
  }
  inputValidation(updateData) {
    let errorInput = [];
    updateData.name = _.trim(updateData.name);
    if (!updateData.name) {
      errorInput.push(LocalMessages.messages['15']);
    } else if (!this._ValidateService.checkValidInputName(updateData.name, true)) {
      errorInput.push(LocalMessages.messages['1']);
    } else if (_.indexOf(this.data.listName, updateData.name) > -1) {
      errorInput.push(LocalMessages.messages['29']);
    }
    if (updateData.headCubicFactor === '') {
      errorInput.push(LocalMessages.messages['15']);
    } else {
      updateData.headCubicFactor = this.checkInvalid(updateData.headCubicFactor, errorInput, "Head (Cubic Factor) is invalid");
      if (updateData.headCubicFactor > 1000) {
        errorInput.push('Maximum value of Head (Cubic Factor) is 1,000');
      }
    }
    if (updateData.flowRate === '') {
      errorInput.push(LocalMessages.messages['15']);
    } else {
      updateData.flowRate = this.checkInvalid(updateData.flowRate, errorInput, "Flow Rate[m3/h] is invalid");
      if (updateData.flowRate > 100000) {
        errorInput.push('Maximum value of Flow Rate[m3/h] is 100,000');
      }
    }
    if (updateData.headProportionalFactor) {
      updateData.headProportionalFactor = this.checkInvalid(updateData.headProportionalFactor, errorInput, "Head (Proportional Factor) is invalid");
      if (updateData.headProportionalFactor > 1000) {
        errorInput.push('Maximum value of Head (Proportional Factor) is 1,000');
      }
    }
    if (updateData.maxFlowRateRatio) {
      updateData.maxFlowRateRatio = this.checkInvalid(updateData.maxFlowRateRatio, errorInput, "Maximum Flow Rate Ratio[%] is invalid");
      if (updateData.maxFlowRateRatio > 200) {
        errorInput.push('Max value of Maximum Flow Rate Ratio[%] is 200');
      }
    }
    if (updateData.minFlowRateRatio) {
      updateData.minFlowRateRatio = this.checkInvalid(updateData.minFlowRateRatio, errorInput, "Minimum Flow Rate Ratio[%] is invalid");
      if (updateData.minFlowRateRatio > 100) {
        errorInput.push('Max value of Minimum Flow Rate Ratio[%] is 100');
      }
    }
    if (updateData.maxFlowRateRatio < updateData.minFlowRateRatio) {
      errorInput.push(LocalMessages.messages['110']);
    }
    if (updateData.statusOffDefaultValue) {
      updateData.statusOffDefaultValue = this.checkInvalid(updateData.statusOffDefaultValue, errorInput, "Default Value When Status Is Off[%Hz] is invalid");
      if (updateData.statusOffDefaultValue > 200) {
        errorInput.push('Maximum value of Default Value When Status Is Off[%Hz] is 200');
      }
    }
    return errorInput;
  }
  setDefault() {
    this.updateData.headProportionalFactor = this.dataDefault.headProportionalFactor;
    this.updateData.maxFlowRateRatio = this.dataDefault.maxFlowRateRatio;
    this.updateData.minFlowRateRatio = this.dataDefault.minFlowRateRatio;
    this.updateData.flowRate = this.dataDefault.flowRateCDWP;
  }
  floatInput(event) {
    return event.charCode >= 48 &&
      event.charCode <= 57 ||
      event.charCode == 46
  }
  checkInvalid(item, errorList, message) {
    if (_.isNaN(Number(item)) == true || Number(item) < 0) {
      errorList.push(message);
      return item;
    } else {
      return Number(item);
    }
  }
}

@Component({
  selector: 'update-chwp-dialog',
  templateUrl: 'update-chwp-dialog.html',
  styleUrls: ['./plant-model.component.scss']
})
export class UpdateCHWPDialog implements OnInit {
  updateData: any = {};
  dataDefault: any;
  inputMaxName: number = VARIABLES.INPUT_MAX_NAME;
  constructor(
    public dialogRef: MatDialogRef<UpdateCHWPDialog>,
    private _UtilitiesService: UtilitiesService,
    private _ValidateService: ValidateService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }
  ngOnInit() {
    this.updateData = _.cloneDeep(this.data);
    this.dataDefault = this.data.dataDefault;
  }

  // handle disable button 'save'
  compareData() {
    if (_.isEqual(this.data, this.updateData)) {
      return true;
    } else if (!this.updateData.name) {
      return true;
    } else if (this.updateData.headCubicFactor === '') {
      return true;
    } else if (this.updateData.flowRate === '') {
      return true;
    }
    return false;
  }

  updateInfo() {
    let errorInput = [];
    errorInput = this.inputValidation(this.updateData);
    if (errorInput.length > 0) {
      this._UtilitiesService.validationErrorDisplay(errorInput);
    } else {
      this.dialogRef.close(this.updateData);
    }
  }
  inputValidation(updateData) {
    let errorInput = [];
    updateData.name = _.trim(updateData.name);
    if (!updateData.name) {
      errorInput.push(LocalMessages.messages['15']);
    } else if (!this._ValidateService.checkValidInputName(updateData.name, true)) {
      errorInput.push(LocalMessages.messages['1']);
    } else if (_.indexOf(this.data.listName, updateData.name) > -1) {
      errorInput.push(LocalMessages.messages['29']);
    }
    if (updateData.headCubicFactor === '') {
      errorInput.push(LocalMessages.messages['15']);
    } else {
      updateData.headCubicFactor = this.checkInvalid(updateData.headCubicFactor, errorInput, "Head (Cubic Factor) is invalid");
      if (updateData.headCubicFactor > 1000) {
        errorInput.push('Maximum value of Head (Cubic Factor) is 1,000');
      }
    }
    if (updateData.flowRate === '') {
      errorInput.push(LocalMessages.messages['15']);
    } else {
      updateData.flowRate = this.checkInvalid(updateData.flowRate, errorInput, "Flow Rate[m3/h] is invalid");
      if (updateData.flowRate > 100000) {
        errorInput.push('Maximum value of Flow Rate[m3/h] is 100,000');
      }
    }
    if (updateData.headProportionalFactor) {
      updateData.headProportionalFactor = this.checkInvalid(updateData.headProportionalFactor, errorInput, "Head (Proportional Factor) is invalid");
      if (updateData.headProportionalFactor > 1000) {
        errorInput.push('Maximum value of Head (Proportional Factor) is 1,000');
      }
    }
    if (updateData.maxFlowRateRatio) {
      updateData.maxFlowRateRatio = this.checkInvalid(updateData.maxFlowRateRatio, errorInput, "Maximum Flow Rate Ratio[%] is invalid");
      if (updateData.maxFlowRateRatio > 200) {
        errorInput.push('Max value of Maximum Flow Rate Ratio[%] is 200');
      }
    }
    if (updateData.minFlowRateRatio) {
      updateData.minFlowRateRatio = this.checkInvalid(updateData.minFlowRateRatio, errorInput, "Minimum Flow Rate Ratio[%] is invalid");
      if (updateData.minFlowRateRatio > 100) {
        errorInput.push('Max value of Minimum Flow Rate Ratio[%] is 100');
      }
    }
    if (updateData.maxFlowRateRatio < updateData.minFlowRateRatio) {
      errorInput.push(LocalMessages.messages['110']);
    }
    return errorInput;
  }
  setDefault() {
    this.updateData.headProportionalFactor = this.dataDefault.headProportionalFactor;
    this.updateData.maxFlowRateRatio = this.dataDefault.maxFlowRateRatio;
    this.updateData.minFlowRateRatio = this.dataDefault.minFlowRateRatio;
    this.updateData.flowRate = this.dataDefault.flowRateCHWP;
  }
  floatInput(event) {
    return event.charCode >= 48 &&
      event.charCode <= 57 ||
      event.charCode == 46
  }
  checkInvalid(item, errorList, message) {
    if (_.isNaN(Number(item)) == true || Number(item) < 0) {
      errorList.push(message);
      return item;
    } else {
      return Number(item);
    }
  }
}

// component dialog add
@Component({
  selector: 'add-cct-dialog',
  templateUrl: 'add-cct-dialog.html',
  styleUrls: ['./plant-model.component.scss']
})
export class AddCctDialog {
  updateData: any = {};
  inputMaxName: number = VARIABLES.INPUT_MAX_NAME;
  constructor(
    public dialogRef: MatDialogRef<AddCctDialog>,
    private _UtilitiesService: UtilitiesService,
    private _ValidateService: ValidateService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.updateData = _.clone(this.data);
  }
  // view
  compareData() {
    if (_.isEqual(this.data, this.updateData)) {
      return true;
    } else if (!this.updateData.name) {
      return true;
    } else if (this.updateData.numOfNewCCT === null) {
      return true;
    }
    return false;
  }

  updateInfo() {
    let errorInput = [];
    errorInput = this.inputValidation(this.updateData);
    if (errorInput.length > 0) {
      this._UtilitiesService.validationErrorDisplay(errorInput);
    } else {
      this.dialogRef.close(this.updateData);
    }
  }
  inputValidation(updateData) {
    let errorInput = [];
    updateData.name = _.trim(updateData.name);
    if (!updateData.name) {
      errorInput.push(LocalMessages.messages['15']);
    } else if (!this._ValidateService.checkValidInputName(updateData.name, true)) {
      errorInput.push(LocalMessages.messages['1']);
    } else if (_.indexOf(this.data.listName, updateData.name) > -1) {
      errorInput.push(LocalMessages.messages['29']);
    }
    if (updateData.numOfNewCCT == null || !_.isInteger(updateData.numOfNewCCT) || updateData.numOfNewCCT < 0) {
      errorInput.push(LocalMessages.messages['1']);
    } else if (updateData.numOfNewCCT > 10) {
      errorInput.push(LocalMessages.messages['31']);
    }
    return errorInput;
  }
  integerInput(event) {
    return event.charCode >= 48 &&
      event.charCode <= 57
  }
}

@Component({
  selector: 'backup-cct-dialog',
  templateUrl: 'backup-cct-dialog.html',
  styleUrls: ['./plant-model.component.scss']
})
export class BackupCCTDialog implements OnInit {
  updateData: any = {};
  dataDefault: any;
  inputMaxName: number = VARIABLES.INPUT_MAX_NAME;
  constructor(
    public dialogRef: MatDialogRef<BackupCCTDialog>,
    private _UtilitiesService: UtilitiesService,
    private _ValidateService: ValidateService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }
  ngOnInit() {
    this.updateData = _.cloneDeep(this.data);
    this.dataDefault = this.data.dataDefault;
  }

  // view
  compareData() {
    if (_.isEqual(this.data, this.updateData)) {
      return true;
    } else if (!this.updateData.name) {
      return true;
    } else if (this.updateData.waterFlowRate === '') {
      return true;
    } else if (this.updateData.airVolume === '') {
      return true;
    }
    return false;
  }

  updateInfo() {
    let errorInput = [];
    errorInput = this.inputValidation(this.updateData);
    if (errorInput.length > 0) {
      this._UtilitiesService.validationErrorDisplay(errorInput);
    } else {
      this.dialogRef.close(this.updateData);
    }
  }
  inputValidation(updateData) {
    let errorInput = [];
    updateData.name = _.trim(updateData.name);
    if (!updateData.name) {
      errorInput.push(LocalMessages.messages['15']);
    } else if (!this._ValidateService.checkValidInputName(updateData.name, true)) {
      errorInput.push(LocalMessages.messages['1']);
    } else if (_.indexOf(this.data.listName, updateData.name) > -1) {
      errorInput.push(LocalMessages.messages['29']);
    }
    if (updateData.inputPower === '') {
      errorInput.push(LocalMessages.messages['15']);
    } else {
      updateData.inputPower = this.checkInvalid(updateData.inputPower, errorInput, "Input Power[kW] is invalid");
      if (updateData.inputPower > 100000) {
        errorInput.push('Maximum value of Input Power[kW] is 100,000');
      }
    }
    if (updateData.waterFlowRate === '') {
      errorInput.push(LocalMessages.messages['15']);
    } else {
      updateData.waterFlowRate = this.checkInvalid(updateData.waterFlowRate, errorInput, "Water Flow Rate[m3/min] is invalid");
      if (updateData.waterFlowRate > 10000) {
        errorInput.push('Maximum value of Flow Rate[m3/min] is 10,000');
      }
    }
    if (updateData.outdoorWetBulbTemp) {
      updateData.outdoorWetBulbTemp = this.checkInvalid(updateData.outdoorWetBulbTemp, errorInput, "Outdoor Wet-bulb Temperature[C] is invalid");
      if (updateData.outdoorWetBulbTemp > 150) {
        errorInput.push('Maximum value of Outdoor Wet-bulb Temperature[C] is 150');
      }
    }
    if (updateData.airVolume === '') {
      errorInput.push(LocalMessages.messages['15']);
    } else {
      updateData.airVolume = this.checkInvalid(updateData.airVolume, errorInput, "Air Volume[m3/min] is invalid");
      if (updateData.airVolume > 1000000) {
        errorInput.push('Maximum value of Volume[m3/min] is 1,000,000');
      }
    }
    if (updateData.maxAirVolume) {
      updateData.maxAirVolume = this.checkInvalid(updateData.maxAirVolume, errorInput, "Maximum Air Volume Rate[-] is invalid");
      if (updateData.maxAirVolume > 200) {
        errorInput.push('Max value of Maximum Air Volume Rate[%] is 200');
      }
    }
    if (updateData.minAirVolume) {
      updateData.minAirVolume = this.checkInvalid(updateData.minAirVolume, errorInput, "Minimum Air Volume Rate[%] is invalid");
      if (updateData.minAirVolume > 200) {
        errorInput.push('Max value of Minimum Air Volume Rate[%] is 200');
      }
    }
    if (updateData.maxAirVolume < updateData.minAirVolume) {
      errorInput.push(LocalMessages.messages['109']);
    }
    if (updateData.ratedFreq) {
      updateData.ratedFreq = this.checkInvalid(updateData.ratedFreq, errorInput, "Rated Frequency[Hz] is invalid");
      if (updateData.ratedFreq > 100) {
        errorInput.push('Max value of Rated Frequency[Hz] is 100');
      }
    }
    if (updateData.statusOffDefaultValue) {
      updateData.statusOffDefaultValue = this.checkInvalid(updateData.statusOffDefaultValue, errorInput, "Default Value When Status Is Off[C] is invalid");
      if (updateData.statusOffDefaultValue > 100) {
        errorInput.push('Max value of Default Value When Status Is Off[C] is 100');
      }
    }
    return errorInput;
  }
  setDefault() {
    this.updateData.outdoorWetBulbTemp = this.dataDefault.outdoorWetBulbTemp;
    this.updateData.maxAirVolume = this.dataDefault.maxAirVolume;
    this.updateData.minAirVolume = this.dataDefault.minAirVolume;
    this.updateData.ratedFreq = this.dataDefault.ratedFreq;
    this.updateData.waterFlowRate = this.dataDefault.waterFlowRate;
    this.updateData.airVolume = this.dataDefault.airVolume;
  }
  floatInput(event) {
    return event.charCode >= 48 &&
      event.charCode <= 57 ||
      event.charCode == 46
  }
  checkInvalid(item, errorList, message) {
    if (_.isNaN(Number(item)) == true || Number(item) < 0) {
      errorList.push(message);
      return item;
    } else {
      return Number(item);
    }
  }
}

@Component({
  selector: 'backup-cdwp-dialog',
  templateUrl: 'backup-cdwp-dialog.html',
  styleUrls: ['./plant-model.component.scss']
})
export class BackupCDWPDialog implements OnInit {
  updateData: any;
  dataDefault: any;
  inputMaxName: number = VARIABLES.INPUT_MAX_NAME;
  constructor(
    public dialogRef: MatDialogRef<BackupCDWPDialog>,
    private _UtilitiesService: UtilitiesService,
    private _ValidateService: ValidateService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }
  ngOnInit() {
    this.updateData = _.cloneDeep(this.data);
    this.dataDefault = this.data.dataDefault;
  }

  // handle disable button 'save'
  compareData() {
    if (_.isEqual(this.data, this.updateData)) {
      return true;
    } else if (!this.updateData.name) {
      return true;
    } else if (this.updateData.headCubicFactor === '') {
      return true;
    } else if (this.updateData.flowRate === '') {
      return true;
    }
    return false;
  }

  updateInfo() {
    let errorInput = [];
    errorInput = this.inputValidation(this.updateData);
    if (errorInput.length > 0) {
      this._UtilitiesService.validationErrorDisplay(errorInput);
    } else {
      this.dialogRef.close(this.updateData);
    }
  }
  inputValidation(updateData) {
    let errorInput = [];
    updateData.name = _.trim(updateData.name);
    if (!updateData.name) {
      errorInput.push(LocalMessages.messages['15']);
    } else if (!this._ValidateService.checkValidInputName(updateData.name, true)) {
      errorInput.push(LocalMessages.messages['1']);
    } else if (_.indexOf(this.data.listName, updateData.name) > -1) {
      errorInput.push(LocalMessages.messages['29']);
    }
    if (updateData.headCubicFactor === '') {
      errorInput.push(LocalMessages.messages['15']);
    } else {
      updateData.headCubicFactor = this.checkInvalid(updateData.headCubicFactor, errorInput, "Head (Cubic Factor) is invalid");
      if (updateData.headCubicFactor > 1000) {
        errorInput.push('Maximum value of Head (Cubic Factor) is 1,000');
      }
    }
    if (updateData.flowRate === '') {
      errorInput.push(LocalMessages.messages['15']);
    } else {
      updateData.flowRate = this.checkInvalid(updateData.flowRate, errorInput, "Flow Rate[m3/h] is invalid");
      if (updateData.flowRate > 100000) {
        errorInput.push('Maximum value of Flow Rate[m3/h] is 100,000');
      }
    }
    if (updateData.headProportionalFactor) {
      updateData.headProportionalFactor = this.checkInvalid(updateData.headProportionalFactor, errorInput, "Head (Proportional Factor) is invalid");
      if (updateData.headProportionalFactor > 1000) {
        errorInput.push('Maximum value of Head (Proportional Factor) is 1,000');
      }
    }
    if (updateData.maxFlowRateRatio) {
      updateData.maxFlowRateRatio = this.checkInvalid(updateData.maxFlowRateRatio, errorInput, "Maximum Flow Rate Ratio[%] is invalid");
      if (updateData.maxFlowRateRatio > 200) {
        errorInput.push('Max value of Maximum Flow Rate Ratio[%] is 200');
      }
    }
    if (updateData.minFlowRateRatio) {
      updateData.minFlowRateRatio = this.checkInvalid(updateData.minFlowRateRatio, errorInput, "Minimum Flow Rate Ratio[%] is invalid");
      if (updateData.minFlowRateRatio > 100) {
        errorInput.push('Max value of Minimum Flow Rate Ratio[%] is 100');
      }
    }
    if (updateData.maxFlowRateRatio < updateData.minFlowRateRatio) {
      errorInput.push(LocalMessages.messages['110']);
    }
    if (updateData.statusOffDefaultValue) {
      updateData.statusOffDefaultValue = this.checkInvalid(updateData.statusOffDefaultValue, errorInput, "Default Value When Status Is Off[%Hz] is invalid");
      if (updateData.statusOffDefaultValue > 200) {
        errorInput.push('Maximum value of Default Value When Status Is Off[%Hz] is 200');
      }
    }

    return errorInput;
  }
  setDefault() {
    this.updateData.headProportionalFactor = this.dataDefault.headProportionalFactor;
    this.updateData.maxFlowRateRatio = this.dataDefault.maxFlowRateRatio;
    this.updateData.minFlowRateRatio = this.dataDefault.minFlowRateRatio;
  }
  floatInput(event) {
    return event.charCode >= 48 &&
      event.charCode <= 57 ||
      event.charCode == 46
  }
  checkInvalid(item, errorList, message) {
    if (_.isNaN(Number(item)) == true || Number(item) < 0) {
      errorList.push(message);
      return item;
    } else {
      return Number(item);
    }
  }
}

@Component({
  selector: 'backup-chwp-dialog',
  templateUrl: 'backup-chwp-dialog.html',
  styleUrls: ['./plant-model.component.scss']
})
export class BackupCHWPDialog implements OnInit {
  updateData: any;
  dataDefault: any;
  inputMaxName: number = VARIABLES.INPUT_MAX_NAME;
  constructor(
    public dialogRef: MatDialogRef<BackupCHWPDialog>,
    private _UtilitiesService: UtilitiesService,
    private _ValidateService: ValidateService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }
  ngOnInit() {
    this.updateData = _.cloneDeep(this.data);
    this.dataDefault = this.data.dataDefault;
  }

  // handle disable button 'save'
  compareData() {
    if (_.isEqual(this.data, this.updateData)) {
      return true;
    } else if (!this.updateData.name) {
      return true;
    } else if (this.updateData.headCubicFactor === '') {
      return true;
    } else if (this.updateData.flowRate === '') {
      return true;
    }
    return false;
  }
  updateInfo() {
    let errorInput = [];
    errorInput = this.inputValidation(this.updateData);
    if (errorInput.length > 0) {
      this._UtilitiesService.validationErrorDisplay(errorInput);
    } else {
      this.dialogRef.close(this.updateData);
    }
  }
  inputValidation(updateData) {
    let errorInput = [];
    updateData.name = _.trim(updateData.name);
    if (!updateData.name) {
      errorInput.push(LocalMessages.messages['15']);
    } else if (!this._ValidateService.checkValidInputName(updateData.name, true)) {
      errorInput.push(LocalMessages.messages['1']);
    } else if (_.indexOf(this.data.listName, updateData.name) > -1) {
      errorInput.push(LocalMessages.messages['29']);
    }
    if (updateData.headCubicFactor === '') {
      errorInput.push(LocalMessages.messages['15']);
    } else {
      updateData.headCubicFactor = this.checkInvalid(updateData.headCubicFactor, errorInput, "Head (Cubic Factor) is invalid");
      if (updateData.headCubicFactor > 1000) {
        errorInput.push('Maximum value of Head (Cubic Factor) is 1,000');
      }
    }
    if (updateData.flowRate === '') {
      errorInput.push(LocalMessages.messages['15']);
    } else {
      updateData.flowRate = this.checkInvalid(updateData.flowRate, errorInput, "Flow Rate[m3/h] is invalid");
      if (updateData.flowRate > 100000) {
        errorInput.push('Maximum value of Flow Rate[m3/h] is 100,000');
      }
    }
    if (updateData.headProportionalFactor) {
      updateData.headProportionalFactor = this.checkInvalid(updateData.headProportionalFactor, errorInput, "Head (Proportional Factor) is invalid");
      if (updateData.headProportionalFactor > 1000) {
        errorInput.push('Maximum value of Head (Proportional Factor) is 1,000');
      }
    }
    if (updateData.maxFlowRateRatio) {
      updateData.maxFlowRateRatio = this.checkInvalid(updateData.maxFlowRateRatio, errorInput, "Maximum Flow Rate Ratio[%] is invalid");
      if (updateData.maxFlowRateRatio > 200) {
        errorInput.push('Max value of Maximum Flow Rate Ratio[%] is 200');
      }
    }
    if (updateData.minFlowRateRatio) {
      updateData.minFlowRateRatio = this.checkInvalid(updateData.minFlowRateRatio, errorInput, "Minimum Flow Rate Ratio[%] is invalid");
      if (updateData.minFlowRateRatio > 100) {
        errorInput.push('Max value of Minimum Flow Rate Ratio[%] is 100');
      }
    }
    if (updateData.maxFlowRateRatio < updateData.minFlowRateRatio) {
      errorInput.push(LocalMessages.messages['110']);
    }
    return errorInput;
  }
  setDefault() {
    this.updateData.headProportionalFactor = this.dataDefault.headProportionalFactor;
    this.updateData.maxFlowRateRatio = this.dataDefault.maxFlowRateRatio;
    this.updateData.minFlowRateRatio = this.dataDefault.minFlowRateRatio;
  }
  floatInput(event) {
    return event.charCode >= 48 &&
      event.charCode <= 57 ||
      event.charCode == 46
  }
  checkInvalid(item, errorList, message) {
    if (_.isNaN(Number(item)) == true || Number(item) < 0) {
      errorList.push(message);
      return item;
    } else {
      return Number(item);
    }
  }
}