#!/usr/bin/env python3
"""Fixed, input-free CPython scenarios used by Runtime Lab."""

from __future__ import annotations

import asyncio
import dis
import gc
import io
import json
import platform
import sys
import time
import weakref
from dataclasses import dataclass
from typing import Any, Iterator


def emit(lane: str, event_type: str, key: str, **data: Any) -> None:
    print(
        json.dumps(
            {"lane": lane, "type": event_type, "key": key, "data": data},
            ensure_ascii=False,
        ),
        flush=True,
    )


def version_event() -> None:
    emit(
        "python",
        "runtime",
        "python.version",
        implementation=platform.python_implementation(),
        version=platform.python_version(),
    )


def run_syntax() -> None:
    version_event()
    orders = [
        {"id": "A-10", "status": "paid", "price": 120, "qty": 2},
        {"id": "A-11", "status": "draft", "price": 80, "qty": 1},
        {"id": "A-12", "status": "paid", "price": 50, "qty": 3},
    ]
    emit("objects", "state", "syntax.objects", count=len(orders))

    paid = [order for order in orders if order["status"] == "paid"]
    total = sum(order["price"] * order["qty"] for order in paid)
    emit(
        "comprehension",
        "result",
        "syntax.comprehension",
        ids=", ".join(order["id"] for order in paid),
        total=total,
    )

    first, *middle, last = [order["id"] for order in orders]
    emit(
        "sequence",
        "result",
        "syntax.unpack",
        first=first,
        middle=middle,
        last=last,
    )

    labels = [f"{index}:{order['id']}" for index, order in enumerate(orders, start=1)]
    emit("loop", "result", "syntax.enumerate", labels=", ".join(labels))

    def format_order(order: dict[str, Any], *, currency: str = "RUB") -> str:
        return f"{order['id']} · {order['price'] * order['qty']} {currency}"

    emit(
        "function",
        "result",
        "syntax.function",
        rendered=format_order(orders[0], currency="₽"),
    )
    emit("result", "result", "syntax.result")


@dataclass(slots=True)
class CartLine:
    sku: str
    price: int
    quantity: int = 1

    @property
    def subtotal(self) -> int:
        return self.price * self.quantity


def append_bad(item: str, bucket: list[str] = []) -> list[str]:
    bucket.append(item)
    return list(bucket)


def append_safe(item: str, bucket: list[str] | None = None) -> list[str]:
    target = [] if bucket is None else bucket
    target.append(item)
    return target


def even_squares(limit: int) -> Iterator[int]:
    for value in range(limit):
        if value % 2 == 0:
            yield value * value


def classify_event(event: dict[str, Any]) -> str:
    match event:
        case {"type": "order.paid", "payload": {"id": order_id}}:
            return f"paid order {order_id}"
        case {"type": event_type}:
            return f"other event {event_type}"
        case _:
            return "invalid event"


def run_semantics() -> None:
    version_event()
    line = CartLine("book", 450, quantity=2)
    emit(
        "class",
        "result",
        "semantics.dataclass",
        rendered=repr(line),
        subtotal=line.subtotal,
    )

    original = ["node"]
    alias = original
    alias.append("python")
    emit("objects", "mutation", "semantics.alias", shared=original == alias == ["node", "python"])

    bad_first = append_bad("api")
    bad_second = append_bad("worker")
    emit(
        "function",
        "warning",
        "semantics.mutable-default",
        first=bad_first,
        second=bad_second,
    )

    safe_first = append_safe("api")
    safe_second = append_safe("worker")
    emit(
        "function",
        "result",
        "semantics.safe-default",
        first=safe_first,
        second=safe_second,
    )

    emit("generator", "result", "semantics.generator", values=list(even_squares(7)))
    emit(
        "pattern",
        "result",
        "semantics.match",
        label=classify_event({"type": "order.paid", "payload": {"id": "A-42"}}),
    )

    try:
        int("not-a-number")
    except ValueError as error:
        emit("exception", "caught", "semantics.exception", message=str(error))

    stream = io.StringIO()
    with stream:
        stream.write("cleanup is deterministic")
        text = stream.getvalue()
    emit("context", "cleanup", "semantics.context", closed=stream.closed, text=text)
    emit("result", "result", "semantics.result")


def doubled_total(values: list[int]) -> int:
    return sum(value * 2 for value in values)


class CycleNode:
    def __init__(self) -> None:
        self.peer: CycleNode | None = None


async def traced_task(name: str, delay: float, completion: list[str]) -> str:
    emit("asyncio", "start", "asyncio.started", name=name)
    await asyncio.sleep(delay)
    completion.append(name)
    emit("asyncio", "resume", "asyncio.resumed", name=name)
    return name


async def measure_timer_while(blocking_call: Any) -> float:
    started = time.perf_counter()
    timer = asyncio.create_task(asyncio.sleep(0.01))
    await blocking_call()
    await timer
    return max(0.0, (time.perf_counter() - started - 0.01) * 1_000)


async def run_asyncio_round() -> None:
    completion: list[str] = []
    first = asyncio.create_task(traced_task("A", 0.025, completion))
    second = asyncio.create_task(traced_task("B", 0.005, completion))
    emit("asyncio", "schedule", "asyncio.created")
    await asyncio.gather(first, second)
    emit("asyncio", "result", "asyncio.result", order=" → ".join(completion))

    async def block_loop() -> None:
        time.sleep(0.055)

    async def offload_sleep() -> None:
        await asyncio.to_thread(time.sleep, 0.055)

    blocked_delay = await measure_timer_while(block_loop)
    emit("asyncio", "blocking", "asyncio.blocking", delay=round(blocked_delay, 1))
    offloaded_delay = await measure_timer_while(offload_sleep)
    emit("asyncio", "offload", "asyncio.offload", delay=round(offloaded_delay, 1))


def run_runtime() -> None:
    implementation = platform.python_implementation()
    gil_probe = getattr(sys, "_is_gil_enabled", None)
    gil_enabled = gil_probe() if gil_probe else implementation == "CPython"
    emit(
        "runtime",
        "config",
        "runtime.config",
        implementation=implementation,
        version=platform.python_version(),
        gil=gil_enabled,
    )

    operations = [instruction.opname for instruction in dis.get_instructions(doubled_total)]
    emit(
        "bytecode",
        "result",
        "runtime.bytecode",
        operations=" → ".join(operations[:12]),
    )

    frame = sys._getframe()
    visible_locals = ", ".join(sorted(name for name in frame.f_locals if not name.startswith("_")))
    emit(
        "frame",
        "state",
        "runtime.frame",
        functionName=frame.f_code.co_name,
        locals=visible_locals,
    )

    left = CycleNode()
    right = CycleNode()
    left.peer = right
    right.peer = left
    left_ref = weakref.ref(left)
    right_ref = weakref.ref(right)
    alive_before = left_ref() is not None and right_ref() is not None
    del left, right
    collected = gc.collect()
    alive_after = left_ref() is not None or right_ref() is not None
    emit(
        "gc",
        "result",
        "runtime.gc",
        collected=collected,
        aliveBefore=alive_before,
        aliveAfter=alive_after,
    )

    asyncio.run(run_asyncio_round())
    emit("result", "result", "runtime.result")


SCENARIOS = {
    "syntax": run_syntax,
    "semantics": run_semantics,
    "runtime": run_runtime,
}


def main() -> None:
    scenario = sys.argv[1] if len(sys.argv) > 1 else ""
    runner = SCENARIOS.get(scenario)
    if runner is None:
        raise SystemExit(f"unknown scenario: {scenario}")
    runner()


if __name__ == "__main__":
    main()
