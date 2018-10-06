export interface Packet {
    timestamp: number,
    data: string,
}
export interface RawMsg {
    packet: Packet
}
