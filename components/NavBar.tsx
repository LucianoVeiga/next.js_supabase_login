import Link from "next/link";

export default function NavBar() {
	return(
		<aside className="aside">
			<Link href="/employees">Empleados
			</Link>
			<hr />
		</aside>
	)
}