import { Visitor } from "./Visitor";

export class DeliveryDate extends Visitor {
  constructor(
    protected id?: number,
    protected deliveryDate: Date = new Date(),

  ) {
    super();
  }

  public getId(): number | undefined {
    return this.id;
  }

  public getDeliveryDate(): Date {
    return this.deliveryDate;
  }

  public setId(id: number) {
    this.id = id;
  }

  public setDeliveryDate(deliveryDate: Date) {
    this.deliveryDate = deliveryDate;
  }
}

export class CourseSchedule extends Visitor {

  constructor(
    protected id?: number,
    protected startDate: Date = new Date(),
    protected endDate: Date = new Date(),
    protected deliveryDates: DeliveryDate[] = [],
  ) {
    super();
  }

  public getId(): number | undefined {
    return this.id;
  }

  public getStartDate(): Date {
    return this.startDate;
  }

  public getEndDate(): Date {
    return this.endDate;
  }

  public getDeliveryDates(): DeliveryDate[] {
    return this.deliveryDates;
  }

  public setId(id: number) {
    this.id = id;
  }

  public setStartDate(startDate: Date) {
    this.startDate = startDate;
  }

  public setEndDate(endDate: Date) {
    this.endDate = endDate;
  }

  public setDeliveryDates(deliveryDates: DeliveryDate[]) {
    this.deliveryDates = deliveryDates;
  }

}