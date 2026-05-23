import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Product } from "@/features/admin/products/types";
import { getCoverImage } from "@/features/admin/products/use-product-form";
import { Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const wrapperClass = "overflow-x-auto rounded-xl border border-border";

const tableHeaderClass = "bg-muted/50";

const imageHeadClass = "w-[90px]";

const editHeadClass = "w-[80px] text-right";

const stateCellClass = "h-28 text-center text-muted-foreground";

const imageBoxClass =
  "h-14 w-14 overflow-hidden rounded-lg border border-border bg-muted";

const imageClass = "h-full w-full object-cover";

const titleWrapClass = "space-y-1";

const titleClass = "font-medium text-foreground";

const descriptionClass = "line-clamp-1 text-xs text-muted-foreground";

const editCellWrapClass = "flex justify-end";

const editIconClass = "h-4 w-4";

const paginationClass = "flex items-center justify-between px-4 py-4 border-t border-border";

const paginationInfoClass = "text-sm text-muted-foreground";

const paginationButtonsClass = "flex gap-2";

type ProductsTableProps = {
  products: Product[];
  onEdit: (product: Product) => void;
  loading: boolean;
};

export function ProductsTable({
  products,
  onEdit,
  loading,
}: ProductsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate pagination
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className={wrapperClass}>
      <Table>
        <TableHeader className={tableHeaderClass}>
          <TableRow>
            <TableHead className={imageHeadClass}>Image</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead className={editHeadClass}>Edit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className={stateCellClass}>
                Loading Products...
              </TableCell>
            </TableRow>
          ) : products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className={stateCellClass}>
                No products found!!!
              </TableCell>
            </TableRow>
          ) : (
            currentProducts.map((product) => {
              const cover = getCoverImage(product.images);
              return (
                <TableRow key={product._id}>
                  <TableCell>
                    <div className={imageBoxClass}>
                      {cover ? (
                        <img
                          src={cover.url}
                          alt={product.title}
                          className={imageClass}
                        />
                      ) : null}
                    </div>
                  </TableCell>

                  <TableCell>{product.title}</TableCell>
                  <TableCell>{product.brand}</TableCell>
                  <TableCell>{product.category?.name}</TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        product.status === "active" ? "default" : "secondary"
                      }
                    >
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <div className={editCellWrapClass}>
                      <Button
                        size={"icon"}
                        variant="ghost"
                        onClick={() => onEdit(product)}
                      >
                        <Pencil className={editIconClass} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      
      {!loading && products.length > 0 && (
        <div className={paginationClass}>
          <div className={paginationInfoClass}>
            Showing {startIndex + 1} to {Math.min(endIndex, products.length)} of {products.length} products
          </div>
          <div className={paginationButtonsClass}>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}