export class UnitPriceValueObject {
    unitValue: string;
    from: string;
    to: string;
}

export class UnitPriceObject{
    priceId:string;
    fromDate:Date;
    toDate:Date;
    status:number;
    type:number;
    currency:number;
    unitPriceValue: UnitPriceValueObject[];
}