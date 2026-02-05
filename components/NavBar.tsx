import Link from "next/link";

export default function NavBar() {
	return(
		<div>
			<Link href="/employees">Empleados
			</Link>
			<Link href="/crews">Cuadrillas
			</Link>
			<hr />
		</div>
	)
}