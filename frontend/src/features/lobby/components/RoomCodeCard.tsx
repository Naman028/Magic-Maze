export function RoomCodeCard({ roomCode }: { roomCode: string }) {
  return (
    <section className="panel room-code">
      <span>ROOM CODE</span>
      <strong>{roomCode}</strong>
    </section>
  );
}
